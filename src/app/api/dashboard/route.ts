import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [todaySales, stockLevels, recentSales] = await Promise.all([
      prisma.sale.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
      }),
      prisma.product.count({
        where: { stockLevel: { lt: prisma.product.fields.minStockLevel } }
      }),
      prisma.sale.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true }
      })
    ]);

    return NextResponse.json({
      todaySales: todaySales._sum.total || 0,
      lowStockCount: stockLevels,
      recentSales: recentSales
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
