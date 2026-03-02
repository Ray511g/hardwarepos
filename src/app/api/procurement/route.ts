import { prisma, dbConnected } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const globalStore = global as any;
if (!globalStore.simOrders) {
  globalStore.simOrders = [
    { orderNumber: 'PO-BAM-001', supplier: { name: 'Bamburi Cement' }, createdAt: new Date().toISOString(), totalAmount: 125000, status: 'RECEIVED' },
    { orderNumber: 'PO-DVK-002', supplier: { name: 'Devki Steel' }, createdAt: new Date().toISOString(), totalAmount: 85000, status: 'RECEIVED' }
  ];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { supplierId, orderNumber, items } = body;

    if (!dbConnected) {
       const newOrder = { 
          id: `sim-${Date.now()}`, 
          orderNumber: orderNumber || `SIM-PO-${Date.now()}`, 
          totalAmount: items.reduce((acc: number, i: any) => acc + (parseFloat(i.quantity) * parseFloat(i.costPrice)), 0),
          createdAt: new Date().toISOString(),
          status: 'RECEIVED'
       };
       globalStore.simOrders.push(newOrder);
       return NextResponse.json({ success: true, order: newOrder });
    }

    const result = await prisma.$transaction(async (tx) => {
      const totalAmount = items.reduce((acc: number, i: any) => acc + (parseFloat(i.quantity) * parseFloat(i.costPrice)), 0);
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          orderNumber: orderNumber || `PO-${Date.now()}`,
          supplierId: supplierId,
          totalAmount: totalAmount,
          status: 'RECEIVED',
          receivedAt: new Date(),
          items: {
            create: items.map((i: any) => ({
              productId: i.productId,
              quantity: parseFloat(i.quantity),
              costPrice: parseFloat(i.costPrice),
              subtotal: parseFloat(i.quantity) * parseFloat(i.costPrice),
            }))
          }
        }
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
             stockLevel: { increment: parseFloat(item.quantity) },
             costPrice: parseFloat(item.costPrice)
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
   if (!dbConnected) return NextResponse.json(globalStore.simOrders);
   try {
      const orders = await prisma.purchaseOrder.findMany({
         include: { supplier: true, items: { include: { product: true } } },
         orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(orders.length > 0 ? orders : globalStore.simOrders);
   } catch (error) {
      return NextResponse.json(globalStore.simOrders);
   }
}
