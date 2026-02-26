import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders, checkPermission } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';
import { logAction } from '../../../lib/audit';

import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const method = req.method?.toUpperCase();

    if (method === 'GET') {
        if (!checkPermission(user, 'students', 'VIEW', res)) return;
        try {
            const { grade, search, page = '1', limit = '50', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
            const take = parseInt(limit as string);

            const where: any = {};
            if (grade) where.grade = grade as string;
            if (search) {
                const searchStr = search as string;
                where.OR = [
                    { firstName: { contains: searchStr, mode: 'insensitive' } },
                    { lastName: { contains: searchStr, mode: 'insensitive' } },
                    { admissionNumber: { contains: searchStr, mode: 'insensitive' } },
                ];
            }

            const [students, total] = await Promise.all([
                prisma.student.findMany({
                    where,
                    orderBy: { [sortBy as string]: sortOrder as string },
                    skip,
                    take,
                }),
                prisma.student.count({ where })
            ]);

            return res.status(200).json({
                students,
                meta: {
                    total,
                    page: parseInt(page as string),
                    limit: take,
                    totalPages: Math.ceil(total / take)
                }
            });
        } catch (error) {
            console.error('API GET Students Error:', error);
            return res.status(500).json({ error: 'Failed to fetch students' });
        }
    }

    if (method === 'POST') {
        if (!checkPermission(user, 'students', 'CREATE', res)) return;
        try {
            const data = req.body;

            // Basic Validation
            if (!data.firstName || !data.lastName || !data.grade) {
                return res.status(400).json({ error: 'Missing required fields: firstName, lastName, grade' });
            }

            let admissionNumber = data.admissionNumber;
            if (!admissionNumber) {
                const count = await prisma.student.count();
                const year = new Date().getFullYear();
                // Sequential generation with zero padding
                admissionNumber = `ELR/${year}/${(count + 1).toString().padStart(4, '0')}`;
            }

            // Ensure unique admission number check manually for better error message
            const existing = await prisma.student.findUnique({ where: { admissionNumber } });
            if (existing) {
                return res.status(400).json({ error: `Admission number ${admissionNumber} already exists` });
            }

            const totalFees = parseFloat(data.totalFees || 0);
            const paidFees = parseFloat(data.paidFees || 0);

            const {
                firstName, lastName, gender, grade, dateOfBirth,
                parentName, parentPhone, parentEmail, address,
                medicalConditions, bloodGroup, emergencyContact, allergies,
                enrollmentDate, status
            } = req.body;

            const student = await prisma.student.create({
                data: {
                    firstName,
                    lastName,
                    gender,
                    grade,
                    dateOfBirth,
                    parentName,
                    parentPhone,
                    parentEmail,
                    address,
                    medicalConditions,
                    bloodGroup,
                    emergencyContact,
                    allergies,
                    enrollmentDate,
                    status: status || 'Active',
                    admissionNumber,
                    totalFees,
                    paidFees,
                    feeBalance: totalFees - paidFees,
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
            if (error.code === 'P2002') {
                return res.status(409).json({ error: 'A user with this unique field already exists' });
            }
            return res.status(500).json({ error: 'Failed to process student registration' });
        }
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
