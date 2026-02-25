import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { calculatePayroll } from '../../../../../utils/payroll';
import { createApprovalRequest } from '../../../../../utils/approvals';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { month, year, requestedBy } = req.body;

        // Check if payroll already exists for this month
        const existing = await prisma.payrollEntry.findFirst({
            where: { month, year }
        });

        if (existing) {
            return res.status(400).json({ error: 'Payroll already initiated for this period.' });
        }

        const staffList = await prisma.staff.findMany({
            where: { status: 'Active' }
        });

        const settings = await prisma.settings.findUnique({
            where: { id: 'global' }
        });

        const entries = [];
        let totalNet = 0;

        for (const staff of staffList) {
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

            const entry = await prisma.payrollEntry.create({
                data: {
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
            totalNet += result.netPay;
        }

        // Create a single approval request for the whole run
        await createApprovalRequest({
            entityType: 'PAYROLL',
            entityId: `PAYROLL-${year}-${month}`,
            requestedById: requestedBy.id,
            requestedByName: requestedBy.name,
            details: {
                period: `${month}/${year}`,
                staffCount: staffList.length,
                totalNetPay: totalNet
            }
        });

        return res.status(201).json({ count: entries.length, totalNet });
    }

    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
