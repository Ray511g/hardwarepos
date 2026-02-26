import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const items = await prisma.inventoryItem.findMany({
            include: { transactions: true },
            orderBy: { name: 'asc' }
        });
        return res.status(200).json(items);
    }
    
    if (req.method === 'POST') {
        const item = await prisma.inventoryItem.create({
            data: req.body
        });
        return res.status(201).json(item);
    }

    if (req.method === 'PUT') {
        const { id, ...data } = req.body;
        const item = await prisma.inventoryItem.update({
            where: { id: String(id) },
            data
        });
        return res.status(200).json(item);
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        await prisma.inventoryItem.delete({
            where: { id: String(id) }
        });
        return res.status(204).end();
    }

    res.status(405).end();
}
