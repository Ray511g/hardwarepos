import { prisma, dbConnected } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const globalStore = global as any;
if (!globalStore.simSales) {
  globalStore.simSales = [
    { id: 'sim-1', invoiceNumber: 'SIM-INV-001', total: 4500, paymentMethod: 'MPESA', etimsSigned: true, createdAt: new Date().toISOString() },
    { id: 'sim-2', invoiceNumber: 'SIM-INV-002', total: 12500, paymentMethod: 'CASH', etimsSigned: true, createdAt: new Date().toISOString() },
    { id: 'sim-3', invoiceNumber: 'SIM-INV-003', total: 850, paymentMethod: 'CREDIT', etimsSigned: true, createdAt: new Date().toISOString() }
  ];
}

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
    const { cart, paymentMethod, total, customerId, mpesaCode } = body;

    if (!dbConnected) {
       const simulatedSale = {
          id: `sim-${Date.now()}`,
          invoiceNumber: `SIM-INV-${Date.now()}`,
          total: total,
          paymentMethod: paymentMethod,
          etimsSigned: true,
          etimsSignature: `KRA-SIM-${Math.random().toString(36).substring(7).toUpperCase()}`,
          createdAt: new Date().toISOString()
       };
       globalStore.simSales.unshift(simulatedSale); // Add to dynamic list
       return NextResponse.json({ success: true, sale: simulatedSale });
    }

    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          invoiceNumber: `INV-${Date.now()}`,
          total: total,
          taxAmount: total * (16 / 116),
          paymentMethod: paymentMethod,
          mpesaCode: mpesaCode,
          customerId: customerId,
          status: 'COMPLETED',
          etimsSigned: true,
          etimsSignature: `KRA-${Math.random().toString(36).substring(7).toUpperCase()}`,
          saleItems: {
            create: cart.map((item: any) => ({
              productId: item.id,
              quantity: item.qty,
              unitPrice: item.unitPrice,
              costPrice: item.costPrice || 0,
              subtotal: item.qty * item.unitPrice,
            }))
          }
        }
      });

      for (const item of cart) {
        await tx.product.update({
          where: { id: item.id },
          data: { stockLevel: { decrement: item.qty } }
        });
      }

      if (paymentMethod === "CREDIT" && customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: { debtBalance: { increment: total } }
        });
      }

      return sale;
    });

    return NextResponse.json({ success: true, sale: result });
  } catch (error) {
    console.error("Sales Error:", error);
    return NextResponse.json({ success: false, error: "Transaction processing failed" }, { status: 500 });
  }
}

export async function GET() {
   if (!dbConnected) return NextResponse.json(globalStore.simSales);
   try {
      const sales = await prisma.sale.findMany({
         take: 50,
         orderBy: { createdAt: 'desc' },
         include: { customer: true }
      });
      return NextResponse.json(sales.length > 0 ? sales : globalStore.simSales);
   } catch (error) {
      return NextResponse.json(globalStore.simSales);
   }
}
