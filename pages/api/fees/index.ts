import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders, checkPermission } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';
import { logAction } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const method = req.method?.toUpperCase();

    if (method === 'GET') {
        if (!checkPermission(user, 'finance', 'VIEW', res)) return;
        try {
            const { studentId, grade, term, page = '1', limit = '50' } = req.query;
            const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
            const take = parseInt(limit as string);

            const where: any = {};
            if (studentId) where.studentId = studentId as string;
            if (grade) where.grade = grade as string;
            if (term) where.term = term as string;

            const [payments, total] = await Promise.all([
                prisma.payment.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take,
                }),
                prisma.payment.count({ where })
            ]);

            return res.status(200).json({
                payments,
                meta: {
                    total,
                    page: parseInt(page as string),
                    limit: take,
                    totalPages: Math.ceil(total / take)
                }
            });
        } catch (error) {
            console.error('API GET Payments Error:', error);
            return res.status(500).json({ error: 'Failed to retrieve payment records' });
        }
    }

    if (method === 'POST') {
        if (!checkPermission(user, 'finance', 'CREATE', res)) return;
        try {
            let { studentId, amount, method: payMethod, reference, date, term, studentName, grade } = req.body;
            const payAmount = parseFloat(amount);

            if (!studentId || !payAmount || payAmount <= 0) {
                return res.status(400).json({ error: 'Valid student ID and positive payment amount are required' });
            }

            const receiptNumber = `RCT-${Date.now().toString().slice(-8)}`;

            // Use transaction for atomic operation
            const result = await prisma.$transaction(async (tx) => {
                const student = await tx.student.findUnique({ where: { id: studentId } });
                if (!student) throw new Error('STUDENT_NOT_FOUND');

                if (!studentName) studentName = `${student.firstName} ${student.lastName}`;
                if (!grade) grade = student.grade;

                const payment = await tx.payment.create({
                    data: {
                        studentId,
                        studentName,
                        grade,
                        amount: payAmount,
                        method: payMethod,
                        reference: reference || '',
                        date: date || new Date().toISOString(),
                        term,
                        receiptNumber
                    },
                });

                const newPaid = student.paidFees + payAmount;
                const updatedStudent = await tx.student.update({
                    where: { id: studentId },
                    data: {
                        paidFees: newPaid,
                        feeBalance: student.totalFees - newPaid
                    },
                });

                return { payment, student: updatedStudent };
            });

            // Ledger Posting (Side effect, keep outside transaction if it manages its own)
            try {
                const { postTransaction } = require('../../../utils/finance');
                const cashAccountCode = payMethod === 'Cash' ? '1001' : '1002';

                await postTransaction(
                    receiptNumber,
                    [
                        { accountCode: cashAccountCode, description: `Fee Payment: ${studentName}`, debit: payAmount, credit: 0 },
                        { accountCode: '1003', description: `Fee Payment: ${studentName}`, debit: 0, credit: payAmount }
                    ],
                    result.payment.id
                );
            } catch (ledgerError) {
                console.warn('Finance Ledger Posting Sync failed, manual reconciliation required:', ledgerError);
            }

            await logAction(
                user.id,
                user.name,
                'RECORD_PAYMENT',
                `Recorded payment ${receiptNumber} of ${payAmount} for ${studentName}`,
                (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
            );

            await touchSync();
            return res.status(201).json(result.payment);
        } catch (error: any) {
            console.error('API POST Payment Error:', error);
            if (error.message === 'STUDENT_NOT_FOUND') return res.status(404).json({ error: 'Student not found' });
            return res.status(500).json({ error: 'Internal system error processing payment' });
        }
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
