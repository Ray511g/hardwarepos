import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
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
    }

    if (req.method === 'POST') {
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
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
