import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const books = await prisma.book.findMany({
            include: { borrows: true },
            orderBy: { title: 'asc' }
        });
        return res.status(200).json(books);
    }
    
    if (req.method === 'POST') {
        const book = await prisma.book.create({
            data: req.body
        });
        return res.status(201).json(book);
    }

    if (req.method === 'PUT') {
        const { id, ...data } = req.body;
        const book = await prisma.book.update({
            where: { id: String(id) },
            data
        });
        return res.status(200).json(book);
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        await prisma.book.delete({
            where: { id: String(id) }
        });
        return res.status(204).end();
    }

    res.status(405).end();
}
