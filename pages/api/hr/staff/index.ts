import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { requireAuth, checkPermission, corsHeaders } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        if (!checkPermission(user, 'hr', 'VIEW', res)) return;
        try {
            const staff = await prisma.staff.findMany({
                include: {
                    contracts: true,
                    loans: true,
                    payrollEntries: {
                        take: 1,
                        orderBy: { createdAt: 'desc' }
                    }
                },
                orderBy: { lastName: 'asc' }
            });
            return res.status(200).json(staff);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch staff' });
        }
    }

    if (req.method === 'POST') {
        if (!checkPermission(user, 'hr', 'CREATE', res)) return;
        try {
            const data = req.body;
            const staff = await prisma.staff.create({
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    type: data.type,
                    role: data.role,
                    designation: data.designation,
                    department: data.department,
                    kraPin: data.kraPin,
                    nssfNumber: data.nssfNumber,
                    nhifNumber: data.nhifNumber,
                    bankName: data.bankName,
                    accountNumber: data.accountNumber,
                    salaryType: data.salaryType || 'Fixed',
                    basicSalary: Number(data.basicSalary) || 0,
                    allowances: data.allowances || [],
                    deductions: data.deductions || [],
                    status: 'Active'
                }
            });
            return res.status(201).json(staff);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to create staff member' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
}
