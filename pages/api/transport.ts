import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const buses = await prisma.bus.findMany({
            include: { routes: true }
        });
        return res.status(200).json(buses);
    }
    
    if (req.method === 'POST') {
        const bus = await prisma.bus.create({
            data: req.body
        });
        return res.status(201).json(bus);
    }

    res.status(405).end();
}
