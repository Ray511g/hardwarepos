import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: 'asc' },
      include: { sales: { take: 5, orderBy: { createdAt: 'desc' } } }
    });
    
    // Fallback for empty DB demo
    if (!customers || customers.length === 0) {
       return NextResponse.json([
          { id: '1', name: 'Nairobi Construction Co.', phone: '0711122233', debtBalance: 0, creditLimit: 250000 },
          { id: '2', name: 'James Otieno (Contractor)', phone: '0722233344', debtBalance: 4500, creditLimit: 50000 },
          { id: '3', name: 'Government Housing Project', phone: '0733344455', debtBalance: 125000, creditLimit: 1000000 }
       ]);
    }
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Postgres Customer API Failure:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
   try {
      const body = await req.json();
      const customer = await prisma.customer.create({
         data: body
      });
      return NextResponse.json(customer);
   } catch (error) {
      return NextResponse.json({ error: "Failed to register customer" }, { status: 500 });
   }
}
