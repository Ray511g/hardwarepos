import { prisma, dbConnected } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, amount, method, reference } = body;

    if (!dbConnected) {
       // Persistent Session Simulation for high-fidelity demo
       return NextResponse.json({ 
          success: true, 
          payment: { 
             id: `sim-pay-${Date.now()}`, 
             customerId, 
             amount, 
             method, 
             reference, 
             createdAt: new Date().toISOString() 
          } 
       });
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          customerId: customerId,
          amount: amount,
          method: method,
          reference: reference,
        }
      });
      await tx.customer.update({
        where: { id: customerId },
        data: { debtBalance: { decrement: amount } }
      });
      return payment;
    });

    return NextResponse.json({ success: true, payment: result });
  } catch (error) {
    console.error("Payment Error:", error);
    return NextResponse.json({ success: false, error: "Payment processing failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
   if (!dbConnected) return NextResponse.json([]);
   try {
      const { searchParams } = new URL(req.url);
      const customerId = searchParams.get('customerId');
      const payments = await prisma.payment.findMany({
         where: customerId ? { customerId: customerId } : {},
         orderBy: { createdAt: 'desc' },
         include: { customer: true }
      });
      return NextResponse.json(payments);
   } catch (error) {
      return NextResponse.json([]);
   }
}
