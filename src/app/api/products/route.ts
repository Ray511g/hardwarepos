import { prisma, dbConnected } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEMO_PRODUCTS = [
  { id: '1', sku: 'CEM-BAM-50', name: 'Bamburi Tembo Cement (50kg)', category: 'Cement', unit: 'Bag', unitPrice: 950, costPrice: 880, stockLevel: 250, minStockLevel: 50, bulkThreshold: 50, bulkDiscountPrice: 920 },
  { id: '2', sku: 'STL-D12-6M', name: 'D12 Deformed Steel Bar (6m)', category: 'Steel', unit: 'Pc', unitPrice: 1250, costPrice: 1100, stockLevel: 120, minStockLevel: 20, bulkThreshold: 20, bulkDiscountPrice: 1210 },
  { id: '3', sku: 'ROF-BOX-3M', name: 'Box Profile Sheet - Blue (3m)', category: 'Roofing', unit: 'Pc', unitPrice: 2400, costPrice: 2100, stockLevel: 45, minStockLevel: 10, bulkThreshold: 10, bulkDiscountPrice: 2320 }
];

export async function GET() {
  if (!dbConnected) return NextResponse.json(DEMO_PRODUCTS);

  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
    
    if (!products || products.length === 0) return NextResponse.json(DEMO_PRODUCTS);
    
    return NextResponse.json(products);
  } catch (error) {
    console.error("Postgres Fetch Failure:", error);
    return NextResponse.json(DEMO_PRODUCTS);
  }
}

export async function POST(req: Request) {
   try {
      const body = await req.json();
      const product = await prisma.product.create({
         data: body
      });
      return NextResponse.json(product);
   } catch (error) {
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
   }
}
