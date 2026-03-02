import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, amount, method, reference } = body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Record Payment Log
      const payment = await tx.payment.create({
        data: {
          customerId: customerId,
          amount: amount,
          method: method, // CASH, MPESA
          reference: reference,
          createdAt: new Date()
        }
      });

      // 2. Decrement Debt Balance
      await tx.customer.update({
        where: { id: customerId },
        data: {
           debtBalance: { decrement: amount }
        }
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
   const { searchParams } = new URL(req.url);
   const customerId = searchParams.get('customerId');

   try {
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
