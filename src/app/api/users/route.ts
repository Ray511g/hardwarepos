import { prisma, dbConnected } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let demoUsers = [
  { id: '1', username: 'admin', name: 'System Admin', role: 'ADMIN' },
  { id: '2', username: 'cashier1', name: 'Main Cashier', role: 'CASHIER' }
];

export async function GET() {
  if (!dbConnected) return NextResponse.json(demoUsers);
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(users.length > 0 ? users : demoUsers);
  } catch (error) {
    return NextResponse.json(demoUsers);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!dbConnected) {
       const newU = { ...body, id: `sim-user-${Date.now()}` };
       demoUsers.push(newU);
       return NextResponse.json(newU);
    }
    
    const user = await prisma.user.create({
      data: body
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error("User POST Error:", error);
    return NextResponse.json({ error: "User creation failed" }, { status: 500 });
  }
}
