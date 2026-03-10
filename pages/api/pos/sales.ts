import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';
import { logAction } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        try {
            const { date, startDate, endDate, limit } = req.query;

            const where: any = {};
            if (date) {
                const d = new Date(String(date));
                const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                const end = new Date(start.getTime() + 86400000);
                where.createdAt = { gte: start, lt: end };
            } else if (startDate && endDate) {
                where.createdAt = {
                    gte: new Date(String(startDate)),
                    lte: new Date(String(endDate)),
                };
            }

            const sales = await (prisma as any).pOSSale.findMany({
                where,
                include: { items: true, till: true },
                orderBy: { createdAt: 'desc' },
                take: limit ? Number(limit) : undefined,
            });
            res.setHeader('Cache-Control', 'no-store');
            return res.status(200).json(sales);
        } catch (error) {
            console.error('POS sales GET error:', error);
            return res.status(500).json({ error: 'Failed to fetch sales' });
        }
    }

    if (req.method === 'POST') {
        const { tillId, items, subtotal, tax, discount, total, amountPaid, change, paymentMethod, mpesaRef, tillRef, customerName } = req.body;

        if (!items || !items.length || total === undefined) {
            return res.status(400).json({ error: 'Sale items and total are required' });
        }

        try {
            const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

            // Create sale and decrement stock in a transaction
            const sale = await (prisma as any).$transaction(async (tx: any) => {
                const newSale = await tx.pOSSale.create({
                    data: {
                        receiptNumber,
                        tillId: tillId || null,
                        subtotal: Number(subtotal),
                        tax: Number(tax || 0),
                        discount: Number(discount || 0),
                        total: Number(total),
                        amountPaid: Number(amountPaid),
                        change: Number(change || 0),
                        paymentMethod: paymentMethod || 'Cash',
                        mpesaRef: mpesaRef || null,
                        tillRef: tillRef || null,
                        cashierId: user.id,
                        cashierName: user.name,
                        customerName: customerName || null,
                        status: 'COMPLETED',
                        items: {
                            create: items.map((item: any) => ({
                                productId: item.productId,
                                productName: item.productName,
                                quantity: Number(item.quantity),
                                unitPrice: Number(item.unitPrice),
                                discount: Number(item.discount || 0),
                                total: Number(item.total),
                            }))
                        }
                    },
                    include: { items: true, till: true }
                });

                // Decrement product stock
                for (const item of items) {
                    await tx.pOSProduct.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: Number(item.quantity) } }
                    });
                }

                return newSale;
            });

            await logAction(user.id, user.name, 'CREATE_POS_SALE', `Sale: ${receiptNumber} – KSh ${total}`, { module: 'POS' });

            return res.status(201).json(sale);
        } catch (error) {
            console.error('POS sale POST error:', error);
            return res.status(500).json({ error: 'Failed to create sale' });
        }
    }

    // Void / refund a sale
    if (req.method === 'PUT') {
        const { id, status } = req.body;
        if (!id || !status) return res.status(400).json({ error: 'Sale ID and status required' });
        try {
            const updated = await (prisma as any).pOSSale.update({
                where: { id },
                data: { status }
            });

            // Restore stock on void/refund — use a transaction to keep inventory consistent
            if (status === 'REFUNDED' || status === 'VOIDED') {
                await (prisma as any).$transaction(async (tx: any) => {
                    // Re-fetch the update inside the tx so the status is also atomic
                    await tx.pOSSale.update({ where: { id }, data: { status } });
                    const items = await tx.pOSSaleItem.findMany({ where: { saleId: id } });
                    for (const item of items) {
                        await tx.pOSProduct.update({
                            where: { id: item.productId },
                            data: { stock: { increment: item.quantity } },
                        });
                    }
                });
            }

            await logAction(user.id, user.name, 'UPDATE_POS_SALE', `Sale ${id} marked as ${status}`, { module: 'POS' });
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update sale' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
