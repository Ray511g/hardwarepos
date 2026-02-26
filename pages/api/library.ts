import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const books = await prisma.book.findMany({
            include: { borrows: true }
        });
        return res.status(200).json(books);
    }
    
    if (req.method === 'POST') {
        const book = await prisma.book.create({
            data: req.body
        });
        return res.status(201).json(book);
    }

    res.status(405).end();
}
