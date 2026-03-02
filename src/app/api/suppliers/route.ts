import { prisma, dbConnected } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEMO_SUPPLIERS = [
  { id: '1', name: 'Bamburi Cement Ltd', contact: 'Sales Dept', phone: '0700000001', category: 'Cement' },
  { id: '2', name: 'Devki Steel Mills', contact: 'Main Office', phone: '0700000002', category: 'Steel' },
  { id: '3', name: 'Crown Paints Kenya', contact: 'Distributor', phone: '0700000003', category: 'Paint' }
];

export async function GET() {
  if (!dbConnected) return NextResponse.json(DEMO_SUPPLIERS);
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(suppliers.length > 0 ? suppliers : DEMO_SUPPLIERS);
  } catch (error) {
    return NextResponse.json(DEMO_SUPPLIERS);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!dbConnected) return NextResponse.json({ ...body, id: `sim-${Date.now()}` });
    
    const supplier = await prisma.supplier.create({
      data: body
    });
    return NextResponse.json(supplier);
  } catch (error) {
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}
