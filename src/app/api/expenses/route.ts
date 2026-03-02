import { prisma, dbConnected } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const globalStore = global as any;
if (!globalStore.simExpenses) {
  globalStore.simExpenses = [
    { id: '1', category: 'RENT', description: 'Store Rent - Nairobi HQ', amount: 45000, date: new Date().toISOString() },
    { id: '2', category: 'ELECTRICITY', description: 'Monthly Tokens', amount: 8500, date: new Date().toISOString() }
  ];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, description, amount, date } = body;

    if (!dbConnected) {
       const newE = { ...body, id: `sim-exp-${Date.now()}`, date: date || new Date().toISOString() };
       globalStore.simExpenses.push(newE);
       return NextResponse.json({ success: true, expense: newE });
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
    console.error("Expense POST Error:", error);
    return NextResponse.json({ success: false, error: "Failed to record expense" }, { status: 500 });
  }
}

export async function GET() {
   if (!dbConnected) return NextResponse.json(globalStore.simExpenses);
   try {
      const expenses = await prisma.expense.findMany({
         orderBy: { date: 'desc' }
      });
      return NextResponse.json(expenses.length > 0 ? expenses : globalStore.simExpenses);
   } catch (error) {
      return NextResponse.json(globalStore.simExpenses);
   }
}
