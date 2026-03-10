import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        try {
            const { date } = req.query;
            const targetDate = date ? new Date(String(date)) : new Date();
            const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            const end = new Date(start.getTime() + 86400000);

            const [sales, products] = await Promise.all([
                (prisma as any).pOSSale.findMany({
                    where: { createdAt: { gte: start, lt: end }, status: 'COMPLETED' },
                    include: { items: true },
                }),
                (prisma as any).pOSProduct.findMany({
                    where: { isActive: true },
                    select: { id: true, name: true, category: true, stock: true, reorderLevel: true, unit: true },
                }),
            ]);

            const totalRevenue = sales.reduce((s: number, sale: any) => s + sale.total, 0);
            const totalTransactions = sales.length;
            const totalItemsSold = sales.reduce((s: number, sale: any) =>
                s + sale.items.reduce((si: number, item: any) => si + item.quantity, 0), 0);

            // Payment method breakdown
            const byMethod: Record<string, number> = {};
            for (const sale of sales) {
                byMethod[sale.paymentMethod] = (byMethod[sale.paymentMethod] || 0) + sale.total;
            }

            // Top products
            const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
            for (const sale of sales) {
                for (const item of sale.items) {
                    if (!productSales[item.productId]) {
                        productSales[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
                    }
                    productSales[item.productId].qty += item.quantity;
                    productSales[item.productId].revenue += item.total;
                }
            }
            const topProducts = Object.entries(productSales)
                .sort((a, b) => b[1].revenue - a[1].revenue)
                .slice(0, 10)
                .map(([id, d]) => ({ productId: id, ...d }));

            // Low stock alerts
            const lowStock = products.filter((p: any) => p.stock <= p.reorderLevel);

            // Hourly breakdown
            const hourly: Record<string, number> = {};
            for (const sale of sales) {
                const hour = new Date(sale.createdAt).getHours();
                const label = `${hour}:00`;
                hourly[label] = (hourly[label] || 0) + sale.total;
            }

            res.setHeader('Cache-Control', 'no-store');
            return res.status(200).json({
                totalRevenue,
                totalTransactions,
                totalItemsSold,
                byMethod,
                topProducts,
                lowStock,
                hourly,
                date: start.toISOString(),
            });
        } catch (error) {
            console.error('POS reports error:', error);
            return res.status(500).json({ error: 'Failed to generate report' });
        }
    }

    res.setHeader('Allow', ['GET']);
    res.status(405).end();
}
