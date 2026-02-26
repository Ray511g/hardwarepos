import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const items = await prisma.inventoryItem.findMany({
            include: { transactions: true }
        });
        return res.status(200).json(items);
    }
    
    if (req.method === 'POST') {
        const item = await prisma.inventoryItem.create({
            data: req.body
        });
        return res.status(201).json(item);
    }

    res.status(405).end();
}
