import { prisma, dbConnected } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let demoSuppliers = [
  { id: '1', name: 'Bamburi Cement Ltd', contactPerson: 'Sales Dept', phone: '0700000001', email: 'sales@bamburi.co.ke' },
  { id: '2', name: 'Devki Steel Mills', contactPerson: 'Main Office', phone: '0700000002', email: 'info@devki.com' },
  { id: '3', name: 'Crown Paints Kenya', contactPerson: 'Distributor', phone: '0700000003', email: 'orders@crownpaints.co.ke' }
];

export async function GET() {
  if (!dbConnected) return NextResponse.json(demoSuppliers);
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(suppliers.length > 0 ? suppliers : demoSuppliers);
  } catch (error) {
    return NextResponse.json(demoSuppliers);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!dbConnected) {
       const newS = { ...body, id: `sim-sup-${Date.now()}` };
       demoSuppliers.push(newS);
       return NextResponse.json(newS);
    }
    
    const supplier = await prisma.supplier.create({
      data: body
    });
    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Supplier POST Error:", error);
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}
