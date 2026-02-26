import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const buses = await prisma.bus.findMany({
            include: { routes: true },
            orderBy: { plateNumber: 'asc' }
        });
        return res.status(200).json(buses);
    }
    
    if (req.method === 'POST') {
        const bus = await prisma.bus.create({
            data: req.body
        });
        return res.status(201).json(bus);
    }

    if (req.method === 'PUT') {
        const { id, ...data } = req.body;
        const bus = await prisma.bus.update({
            where: { id: String(id) },
            data
        });
        return res.status(200).json(bus);
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        await prisma.bus.delete({
            where: { id: String(id) }
        });
        return res.status(204).end();
    }

    res.status(405).end();
}
