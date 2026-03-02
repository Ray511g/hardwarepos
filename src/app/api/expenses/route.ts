import { prisma, dbConnected } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEMO_EXPENSES = [
  { id: '1', category: 'RENT', description: 'Store Rent - Nairobi HQ', amount: 45000, date: new Date().toISOString() },
  { id: '2', category: 'ELECTRICITY', description: 'Monthly Tokens', amount: 8500, date: new Date().toISOString() }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, description, amount, date } = body;

    if (!dbConnected) {
       return NextResponse.json({ success: true, expense: { ...body, id: `sim-${Date.now()}`, date: date || new Date().toISOString() } });
    }

    const expense = await prisma.expense.create({
      data: {
        category,
        description,
        amount,
        date: date ? new Date(date) : new Date(),
      }
    });

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error("Expense Error:", error);
    return NextResponse.json({ success: true, simulated: true });
  }
}

export async function GET() {
   if (!dbConnected) return NextResponse.json(DEMO_EXPENSES);
   try {
      const expenses = await prisma.expense.findMany({
         orderBy: { date: 'desc' }
      });
      return NextResponse.json(expenses || DEMO_EXPENSES);
   } catch (error) {
      return NextResponse.json(DEMO_EXPENSES);
   }
}
