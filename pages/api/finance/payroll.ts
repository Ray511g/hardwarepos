import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission } from '../../../lib/auth';
import { logAction } from '../../../lib/audit';
import { postTransaction } from '../../../utils/finance';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        if (!checkPermission(user, 'finance', 'VIEW', res)) return;
        const { type } = req.query; // 'staff' or 'entries'
        try {
            if (type === 'staff') {
                const staff = await prisma.staff.findMany({
                    orderBy: { lastName: 'asc' }
                });
                return res.status(200).json(staff);
            } else {
                const entries = await prisma.payrollEntry.findMany({
                    include: { staff: true },
                    orderBy: [{ year: 'desc' }, { month: 'desc' }]
                });
                return res.status(200).json(entries);
            }
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch payroll data' });
        }
    }

    if (req.method === 'POST') {
        if (!checkPermission(user, 'finance', 'EDIT', res)) return;
        const { type } = req.query;

        if (type === 'staff') {
            try {
                const {
                    firstName, lastName, type: staffType, role,
                    email, phone, salaryType, basicSalary,
                    bankName, accountNumber, status
                } = req.body;

                // Sanitize: Convert empty strings to null for optional fields
                const data = {
                    firstName,
                    lastName,
                    type: staffType,
                    role: role || null,
                    email: email?.trim() === '' ? null : email,
                    phone: phone?.trim() === '' ? null : phone,
                    salaryType: salaryType || 'Fixed',
                    basicSalary: Number(basicSalary) || 0,
                    bankName: bankName || null,
                    accountNumber: accountNumber || null,
                    status: status || 'Active'
                };

                const staff = await prisma.staff.create({ data });

                // Update global sync status - Use new Date() for DateTime field
                await prisma.syncStatus.upsert({
                    where: { id: 'global' },
                    update: { lastUpdated: new Date() },
                    create: { id: 'global', lastUpdated: new Date() }
                });

                await logAction(user.id, user.name, 'ADD_STAFF', `Added staff member ${staff.firstName} ${staff.lastName}`, { module: 'Finance' });
                return res.status(201).json(staff);
            } catch (error: any) {
                console.error('Add Staff Error:', error);
                if (error.code === 'P2002') {
                    return res.status(400).json({ error: 'A staff member with this email or phone already exists' });
                }
                return res.status(500).json({ error: error.message || 'Failed to add staff member' });
            }
        }

        // Generate Payroll for a specific month/year
        const { month, year } = req.body;
        try {
            const staffMembers = await prisma.staff.findMany({ where: { status: 'Active' } });
            const settings = await prisma.settings.findUnique({ where: { id: 'global' } });
            const entries = [];

            for (const staff of staffMembers) {
                const result = calculatePayroll({
                    basicSalary: staff.basicSalary,
                    allowances: (staff.allowances as any[]) || [],
                    deductions: (staff.deductions as any[]) || [],
                    settings: settings ? {
                        nssfRate: settings.nssfRate,
                        nssfMax: settings.nssfMax,
                        personalRelief: settings.personalRelief,
                        housingLevyRate: settings.housingLevyRate
                    } : undefined
                });

                const entry = await prisma.payrollEntry.upsert({
                    where: {
                        staffId_month_year: {
                            staffId: staff.id,
                            month,
                            year
                        }
                    },
                    update: {
                        basicSalary: staff.basicSalary,
                        totalAllowances: result.grossSalary - staff.basicSalary,
                        totalDeductions: result.totalDeductions,
                        tax: result.paye,
                        nssf: result.nssf,
                        nhif: result.nhif,
                        housingLevy: result.housingLevy || 0,
                        netPay: result.netPay,
                        status: 'Draft'
                    },
                    create: {
                        staffId: staff.id,
                        month,
                        year,
                        basicSalary: staff.basicSalary,
                        totalAllowances: result.grossSalary - staff.basicSalary,
                        totalDeductions: result.totalDeductions,
                        tax: result.paye,
                        nssf: result.nssf,
                        nhif: result.nhif,
                        housingLevy: result.housingLevy || 0,
                        netPay: result.netPay,
                        status: 'Draft'
                    }
                });
                entries.push(entry);
            }
            await logAction(user.id, user.name, 'GENERATE_PAYROLL', `Generated payroll for ${month}/${year}`, { module: 'Finance' });
            return res.status(201).json({ message: `Payroll generated for ${month}/${year}`, count: entries.length });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to generate payroll' });
        }
    }

    if (req.method === 'PUT') {
        if (!checkPermission(user, 'finance', 'EDIT', res)) return;
        const { type, id: queryId } = req.query;

        if (type === 'staff') {
            try {
                const {
                    firstName, lastName, type: staffType, role,
                    email, phone, salaryType, basicSalary,
                    bankName, accountNumber, status
                } = req.body;

                const data = {
                    firstName,
                    lastName,
                    type: staffType,
                    role: role || null,
                    email: email?.trim() === '' ? null : email,
                    phone: phone?.trim() === '' ? null : phone,
                    salaryType: salaryType || 'Fixed',
                    basicSalary: Number(basicSalary) || 0,
                    bankName: bankName || null,
                    accountNumber: accountNumber || null,
                    status: status || 'Active'
                };

                const updated = await prisma.staff.update({
                    where: { id: queryId as string },
                    data
                });

                // Update global sync status - Use new Date()
                await prisma.syncStatus.upsert({
                    where: { id: 'global' },
                    update: { lastUpdated: new Date() },
                    create: { id: 'global', lastUpdated: new Date() }
                });

                await logAction(user.id, user.name, 'UPDATE_STAFF', `Updated staff member ${updated.firstName} ${updated.lastName}`, { module: 'Finance' });
                return res.status(200).json(updated);
            } catch (error: any) {
                console.error('Update Staff Error:', error);
                if (error.code === 'P2002') {
                    return res.status(400).json({ error: 'A staff member with this email or phone already exists' });
                }
                return res.status(500).json({ error: error.message || 'Failed to update staff member' });
            }
        }

        // Update Payroll status (Review -> Approve -> Lock)
        const { id, status } = req.body;
        try {
            const entry = await prisma.payrollEntry.findUnique({
                where: { id },
                include: { staff: true }
            });
            if (!entry) return res.status(404).json({ error: 'Payroll entry not found' });

            const updated = await prisma.payrollEntry.update({
                where: { id },
                data: { status }
            });

            await logAction(user.id, user.name, 'UPDATE_PAYROLL', `Updated payroll status to ${status} for ${entry.staff.firstName} ${entry.staff.lastName}`, { module: 'Finance' });

            // Create notifications for status changes
            if (status === 'Reviewed') {
                await prisma.notification.create({
                    data: {
                        role: 'Principal',
                        title: 'Payroll Approval Needed',
                        message: `Payroll for ${entry.staff.firstName} ${entry.staff.lastName} (${entry.month}/${entry.year}) is ready for approval.`,
                        type: 'APPROVAL',
                        link: '/finance?tab=Payroll'
                    }
                });
            } else if (status === 'Approved') {
                await prisma.notification.create({
                    data: {
                        role: 'Accountant',
                        title: 'Payroll Approved',
                        message: `Payroll for ${entry.staff.firstName} ${entry.staff.lastName} (${entry.month}/${entry.year}) has been approved.`,
                        type: 'INFO',
                        link: '/finance?tab=Payroll'
                    }
                });
            }

            if (status === 'Locked') {

                // Post to Ledger once locked
                const expenseAccountCode = (entry.staff.type === 'BOM_TEACHER' || entry.staff.type === 'TEACHER') ? '5001' : '5002';

                await postTransaction(
                    `PAY-${entry.id}`,
                    [
                        { accountCode: expenseAccountCode, description: `Payroll: ${entry.staff.firstName} ${entry.staff.lastName} (${entry.month}/${entry.year})`, debit: entry.netPay, credit: 0 },
                        { accountCode: '1002', description: `Salary payment to ${entry.staff.lastName}`, debit: 0, credit: entry.netPay }
                    ],
                    entry.id
                );
            }

            return res.status(200).json(updated);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to update payroll' });
        }
    }

    if (req.method === 'DELETE') {
        if (!checkPermission(user, 'finance', 'EDIT', res)) return;
        const { type, id } = req.query;

        if (type === 'staff') {
            try {
                await prisma.staff.delete({ where: { id: id as string } });
                await logAction(user.id, user.name, 'DELETE_STAFF', `Deleted staff member ID: ${id}`, { module: 'Finance' });
                return res.status(200).json({ success: true });
            } catch (error) {
                return res.status(500).json({ error: 'Failed to delete staff member' });
            }
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
