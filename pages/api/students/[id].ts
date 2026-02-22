import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders, checkPermission } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';
import { logAction } from '../../../lib/audit';

import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const logPath = path.join(process.cwd(), 'api_debug.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${req.method} ${req.url} (ID: ${req.query.id})\nBody: ${JSON.stringify(req.body)}\nHeaders: ${JSON.stringify(req.headers)}\n\n`);

    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const { id } = req.query;

    if (req.method === 'GET') {
        if (!checkPermission(user, 'students', 'VIEW', res)) return;
        try {
            const student = await prisma.student.findUnique({ where: { id: id as string } });
            if (!student) return res.status(404).json({ error: 'Student not found' });
            return res.status(200).json(student);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch student' });
        }
    }

    if (req.method === 'PUT') {
        if (!checkPermission(user, 'students', 'EDIT', res)) return;
        try {
            const data = req.body;
            const existing = await prisma.student.findUnique({ where: { id: id as string } });
            if (!existing) return res.status(404).json({ error: 'Student not found' });

            if (data.totalFees !== undefined || data.paidFees !== undefined) {
                const totalFees = data.totalFees ?? existing.totalFees;
                const paidFees = data.paidFees ?? existing.paidFees;
                data.feeBalance = totalFees - paidFees;
            }
            // Remove fields that shouldn't be sent to Prisma
            delete data.id;
            delete data.createdAt;
            delete data.updatedAt;
            const student = await prisma.student.update({ where: { id: id as string }, data });

            await logAction(
                user.id,
                user.name,
                'UPDATE_STUDENT',
                `Updated details for student: ${student.firstName} ${student.lastName} (${student.admissionNumber})`,
                { module: 'students' }
            );

            await touchSync();
            return res.status(200).json(student);
        } catch (error: any) {
            return res.status(500).json({ error: 'Failed to update student' });
        }
    }

    if (req.method === 'DELETE') {
        if (!checkPermission(user, 'students', 'DELETE', res)) return;
        try {
            const student = await prisma.student.findUnique({ where: { id: id as string } });
            if (!student) return res.status(404).json({ error: 'Student not found in database' });

            // First delete related records to avoid foreign key constraints
            await prisma.attendance.deleteMany({ where: { studentId: id as string } });
            await prisma.payment.deleteMany({ where: { studentId: id as string } });
            await prisma.result.deleteMany({ where: { studentId: id as string } });
            await prisma.student.delete({ where: { id: id as string } });

            await logAction(
                user.id,
                user.name,
                'DELETE_STUDENT',
                `Permanently deleted student: ${student.firstName} ${student.lastName} (${student.admissionNumber})`,
                { module: 'students' }
            );

            await touchSync();
            return res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Delete student error:', error);
            return res.status(500).json({ error: 'Failed to delete student' });
        }
    }

    const logMsg = `\n[${new Date().toISOString()}] 405 ERROR on /[id]: ${req.method} ${req.url}\nHeaders: ${JSON.stringify(req.headers)}\n`;
    fs.appendFileSync(logPath, logMsg);
    console.warn(`[405] Method ${req.method} not allowed on /api/students/${id}`);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
}
