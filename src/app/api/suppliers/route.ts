import { prisma, dbConnected } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const globalStore = global as any;
if (!globalStore.simSuppliers) {
  globalStore.simSuppliers = [
    { id: '1', name: 'Bamburi Cement Ltd', contactPerson: 'Sales Dept', phone: '0700000001', email: 'sales@bamburi.co.ke', category: 'Cement' },
    { id: '2', name: 'Devki Steel Mills', contactPerson: 'Main Office', phone: '0700000002', email: 'info@devki.com', category: 'Steel' },
    { id: '3', name: 'Crown Paints Kenya', contactPerson: 'Distributor', phone: '0700000003', email: 'orders@crownpaints.co.ke', category: 'Paint' }
  ];
}

export async function GET() {
  if (!dbConnected) return NextResponse.json(globalStore.simSuppliers);
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(suppliers.length > 0 ? suppliers : globalStore.simSuppliers);
  } catch (error) {
    return NextResponse.json(globalStore.simSuppliers);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!dbConnected) {
       const newS = { ...body, id: `sim-sup-${Date.now()}` };
       globalStore.simSuppliers.push(newS);
       return NextResponse.json({ success: true, supplier: newS });
    }
    
    const supplier = await prisma.supplier.create({
      data: body
    });
    return NextResponse.json({ success: true, supplier });
  } catch (error) {
    console.error("Supplier POST Error:", error);
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}
