import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders, checkPermission } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';
import { logAction } from '../../../lib/audit';

import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const logPath = path.join(process.cwd(), 'api_debug.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${req.method} ${req.url}\nBody: ${JSON.stringify(req.body)}\nHeaders: ${JSON.stringify(req.headers)}\n\n`);

    corsHeaders(res);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const method = req.method?.toUpperCase();

    if (method === 'GET') {
        if (!checkPermission(user, 'students', 'VIEW', res)) return;
        try {
            const { grade, search } = req.query;
            const where: any = {};
            if (grade) where.grade = grade as string;
            if (search) {
                where.OR = [
                    { firstName: { contains: search as string, mode: 'insensitive' } },
                    { lastName: { contains: search as string, mode: 'insensitive' } },
                    { admissionNumber: { contains: search as string, mode: 'insensitive' } },
                ];
            }
            const students = await prisma.student.findMany({ where, orderBy: { createdAt: 'desc' } });
            return res.status(200).json(students);
        } catch (error) {
            console.error('API GET Students Error:', error);
            return res.status(500).json({ error: 'Failed to fetch students' });
        }
    }

    if (method === 'POST') {
        if (!checkPermission(user, 'students', 'CREATE', res)) return;
        try {
            const data = req.body;

            let admissionNumber = data.admissionNumber;
            if (!admissionNumber) {
                const count = await prisma.student.count();
                const year = new Date().getFullYear();
                admissionNumber = `ELR/${year}/${(count + 1).toString().padStart(3, '0')}`;
            }

            const student = await prisma.student.create({
                data: {
                    ...data,
                    admissionNumber,
                    feeBalance: (data.totalFees || 0) - (data.paidFees || 0),
                },
            });

            await logAction(
                user.id,
                user.name,
                'CREATE_STUDENT',
                `Registered new student: ${student.firstName} ${student.lastName} (${student.admissionNumber})`,
                (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
            );

            await touchSync();
            return res.status(201).json(student);
        } catch (error: any) {
            console.error('API POST Student Error:', error);
            // Check for unique constraint violation (admission number)
            if (error.code === 'P2002') {
                return res.status(409).json({ error: 'Admission number already exists' });
            }
            return res.status(500).json({ error: error.message || 'Failed to create student' });
        }
    }

    const logMsg = `\n[${new Date().toISOString()}] 405 ERROR: ${req.method} ${req.url}\nHeaders: ${JSON.stringify(req.headers)}\n`;
    fs.appendFileSync(logPath, logMsg);
    console.warn(`[405] Method ${req.method} not allowed on /api/students`);
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
