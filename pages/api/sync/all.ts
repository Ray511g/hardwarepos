import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        try {
            // Fetch everything in parallel on the server
            // We use individual try-catch or settled logic if we want to be robust
            const [
                students, teachers, exams, settings, results,
                users, timetable, feeStructures, roles,
                staff, budgets, expenses, payrollEntries,
                suppliers, accounts, journalEntries
            ] = await Promise.all([
                prisma.student.findMany({ orderBy: { lastName: 'asc' } }),
                prisma.teacher.findMany({ orderBy: { lastName: 'asc' } }),
                prisma.exam.findMany({ orderBy: { date: 'desc' } }),
                prisma.settings.findFirst({ include: { timeSlots: { orderBy: { order: 'asc' } } } }),
                prisma.result.findMany(),
                prisma.user.findMany({ include: { role: true }, orderBy: { name: 'asc' } }),
                prisma.timetableEntry.findMany(),
                prisma.feeStructure.findMany({ orderBy: { createdAt: 'desc' } }),
                prisma.role.findMany(),
                prisma.staff.findMany({ orderBy: { lastName: 'asc' } }),
                prisma.budget.findMany({ orderBy: { year: 'desc' } }),
                prisma.expenseRequest.findMany({ orderBy: { createdAt: 'desc' } }),
                prisma.payrollEntry.findMany({ include: { staff: true }, orderBy: { createdAt: 'desc' } }),
                prisma.supplier.findMany({ orderBy: { name: 'asc' } }),
                prisma.account.findMany({ orderBy: { code: 'asc' } }),
                prisma.journalEntry.findMany({ include: { account: true }, orderBy: { date: 'desc' }, take: 200 })
            ]);

            const syncStatus = await prisma.syncStatus.findUnique({ where: { id: 'global' } });

            return res.status(200).json({
                students,
                teachers,
                exams,
                settings,
                results,
                users,
                timetable,
                feeStructures,
                roles,
                staff,
                budgets,
                expenses,
                payrollEntries,
                suppliers,
                accounts,
                journalEntries,
                lastUpdated: syncStatus?.lastUpdated
            });

        } catch (error) {
            console.error('Core sync error:', error);
            return res.status(500).json({ error: 'Failed to synchronize data' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
