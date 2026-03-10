import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';
import { logAction } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        try {
            const products = await (prisma as any).pOSProduct.findMany({
                orderBy: { name: 'asc' },
            });
            return res.status(200).json(products);
        } catch (error) {
            console.error('POS products GET error:', error);
            return res.status(500).json({ error: 'Failed to fetch products' });
        }
    }

    if (req.method === 'POST') {
        const { name, sku, barcode, category, price, cost, stock, reorderLevel, unit, imageUrl, taxRate, isActive } = req.body;
        if (!name || !category || price === undefined) {
            return res.status(400).json({ error: 'Name, category and price are required' });
        }
        try {
            const product = await (prisma as any).pOSProduct.create({
                data: {
                    name,
                    sku: sku || undefined,
                    barcode: barcode || undefined,
                    category,
                    price: Number(price),
                    cost: Number(cost || 0),
                    stock: Number(stock || 0),
                    reorderLevel: Number(reorderLevel || 5),
                    unit: unit || 'pcs',
                    imageUrl: imageUrl || undefined,
                    taxRate: Number(taxRate || 0),
                    isActive: isActive !== false,
                }
            });
            await logAction(user.id, user.name, 'CREATE_POS_PRODUCT', `Added product: ${name}`, { module: 'POS' });
            return res.status(201).json(product);
        } catch (error: any) {
            if (error.code === 'P2002') return res.status(409).json({ error: 'SKU or barcode already exists' });
            console.error('POS product POST error:', error);
            return res.status(500).json({ error: 'Failed to create product' });
        }
    }

    if (req.method === 'PUT') {
        const { id, ...data } = req.body;
        if (!id) return res.status(400).json({ error: 'Product ID required' });
        try {
            const updated = await (prisma as any).pOSProduct.update({
                where: { id },
                data: {
                    ...data,
                    price: data.price !== undefined ? Number(data.price) : undefined,
                    cost: data.cost !== undefined ? Number(data.cost) : undefined,
                    stock: data.stock !== undefined ? Number(data.stock) : undefined,
                    reorderLevel: data.reorderLevel !== undefined ? Number(data.reorderLevel) : undefined,
                    taxRate: data.taxRate !== undefined ? Number(data.taxRate) : undefined,
                }
            });
            await logAction(user.id, user.name, 'UPDATE_POS_PRODUCT', `Updated product: ${updated.name}`, { module: 'POS' });
            return res.status(200).json(updated);
        } catch (error) {
            console.error('POS product PUT error:', error);
            return res.status(500).json({ error: 'Failed to update product' });
        }
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'Product ID required' });
        try {
            await (prisma as any).pOSProduct.update({
                where: { id: String(id) },
                data: { isActive: false }
            });
            await logAction(user.id, user.name, 'DELETE_POS_PRODUCT', `Deactivated product ID: ${id}`, { module: 'POS' });
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete product' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
