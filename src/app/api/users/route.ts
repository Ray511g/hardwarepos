import { prisma, dbConnected } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEMO_USERS = [
  { id: '1', username: 'admin', name: 'System Admin', role: 'ADMIN' },
  { id: '2', username: 'cashier1', name: 'Main Cashier', role: 'CASHIER' }
];

export async function GET() {
  if (!dbConnected) return NextResponse.json(DEMO_USERS);
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(users.length > 0 ? users : DEMO_USERS);
  } catch (error) {
    return NextResponse.json(DEMO_USERS);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!dbConnected) return NextResponse.json({ ...body, id: `sim-${Date.now()}` });
    
    const user = await prisma.user.create({
      data: body
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "User creation failed" }, { status: 500 });
  }
}
