import { prisma, dbConnected } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEMO_ORDERS = [
  { orderNumber: 'PO-DUMMY-1', supplier: { name: 'Bamburi Cement' }, createdAt: new Date().toISOString(), items: [1, 2], totalAmount: 125000 },
  { orderNumber: 'PO-DUMMY-2', supplier: { name: 'Devki Steel' }, createdAt: new Date().toISOString(), items: [1], totalAmount: 85000 }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { supplierId, orderNumber, items } = body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Purchase Order
      const totalAmount = items.reduce((acc: number, i: any) => acc + (i.quantity * i.costPrice), 0);
      
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          orderNumber: orderNumber || `PO-${Date.now()}`,
          supplierId: supplierId,
          totalAmount: totalAmount,
          status: 'RECEIVED', // In this flow, we record what's received
          receivedAt: new Date(),
          items: {
            create: items.map((i: any) => ({
              productId: i.productId,
              quantity: i.quantity,
              costPrice: i.costPrice,
              subtotal: i.quantity * i.costPrice,
            }))
          }
        },
        include: { items: true }
      });

      // 2. Increment Stock & Update Cost Price (Latest stock inward cost)
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
             stockLevel: { increment: item.quantity },
             costPrice: item.costPrice // Update latest cost for Margin logic
          }
        });
      }

      return purchaseOrder;
    });

    return NextResponse.json({ success: true, order: result });
  } catch (error) {
    console.error("Procurement Error:", error);
    return NextResponse.json({ success: false, error: "Stock inward failed" }, { status: 500 });
  }
}

export async function GET() {
   if (!dbConnected) return NextResponse.json(DEMO_ORDERS);
   try {
      const orders = await prisma.purchaseOrder.findMany({
         include: { supplier: true, items: { include: { product: true } } },
         orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(orders);
   } catch (error) {
      return NextResponse.json(DEMO_ORDERS);
   }
}
