import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'elirama-portal-secret-2026';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { admissionNumber, parentPhone } = req.body;

    if (!admissionNumber || !parentPhone) {
        return res.status(400).json({ error: 'Missing admission number or parent phone' });
    }

    try {
        const student = await prisma.student.findUnique({
            where: { admissionNumber },
            include: {
                assessmentScores: true,
                payments: { orderBy: { date: 'desc' }, take: 5 }
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student record not found' });
        }

        // Check if phone matches (basic security for now)
        // Strip non-digits for comparison
        const dbPhone = student.parentPhone.replace(/\D/g, '');
        const inputPhone = parentPhone.replace(/\D/g, '');

        if (!dbPhone.endsWith(inputPhone) && !inputPhone.endsWith(dbPhone)) {
             return res.status(401).json({ error: 'Verification failed. Please check the parent phone number provided during registration.' });
        }

        // Generate a portal token
        const token = jwt.sign({ 
            id: student.id, 
            admissionNumber: student.admissionNumber,
            role: 'PARENT' 
        }, JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({ 
            token, 
            student: {
                id: student.id,
                name: `${student.firstName} ${student.lastName}`,
                grade: student.grade,
                admissionNumber: student.admissionNumber,
                feeBalance: student.feeBalance
            } 
        });

    } catch (error) {
        console.error('Portal Login Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
