import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';
import { logAction } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const { id } = req.query;

    if (req.method === 'PUT') {
        if (!checkPermission(user, 'finance', 'EDIT', res)) return;
        try {
            const { amount, method, reference, date, term } = req.body;
            const oldPayment = await prisma.payment.findUnique({
                where: { id: id as string },
                include: { student: true }
            });
            if (!oldPayment) return res.status(404).json({ error: 'Payment not found' });

            const updatedPayment = await prisma.payment.update({
                where: { id: id as string },
                data: { amount, method, reference, date, term }
            });

            // If amount changed, update student balance
            if (amount !== oldPayment.amount) {
                const student = oldPayment.student;
                if (student) {
                    const diff = amount - oldPayment.amount;
                    const newPaid = student.paidFees + diff;
                    await prisma.student.update({
                        where: { id: oldPayment.studentId },
                        data: { paidFees: newPaid, feeBalance: student.totalFees - newPaid },
                    });
                }
            }

            await logAction(
                user.id,
                user.name,
                'UPDATE_PAYMENT',
                `Updated fee payment for ${oldPayment.student.firstName} ${oldPayment.student.lastName}. New amount: ${amount}`,
                { module: 'Fees', oldValue: oldPayment.amount, newValue: amount }
            );

            await touchSync();
            return res.status(200).json(updatedPayment);
        } catch (error) {
            console.error('Update payment error:', error);
            return res.status(500).json({ error: 'Failed to update payment' });
        }
    }

    if (req.method === 'DELETE') {
        if (!checkPermission(user, 'finance', 'DELETE', res)) return;
        try {
            // Get payment details before deleting
            const payment = await prisma.payment.findUnique({
                where: { id: id as string },
                include: { student: true }
            });
            if (!payment) return res.status(404).json({ error: 'Payment not found' });

            // Delete payment
            await prisma.payment.delete({ where: { id: id as string } });

            // Revert student balance
            const student = payment.student;
            if (student) {
                const newPaid = Math.max(0, student.paidFees - payment.amount);
                await prisma.student.update({
                    where: { id: payment.studentId },
                    data: { paidFees: newPaid, feeBalance: student.totalFees - newPaid },
                });
            }

            await logAction(
                user.id,
                user.name,
                'DELETE_PAYMENT',
                `Deleted fee payment of ${payment.amount} for ${payment.student.firstName} ${payment.student.lastName}`,
                { module: 'Fees' }
            );

            await touchSync();
            return res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Delete payment error:', error);
            if (error?.code === 'P2025') {
                return res.status(404).json({ error: 'Payment not found' });
            }
            return res.status(500).json({ error: 'Failed to delete payment' });
        }
    }

    res.setHeader('Allow', 'PUT, DELETE');
    res.status(405).json({ error: 'Method not allowed' });
}
