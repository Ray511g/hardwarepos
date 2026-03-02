import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// High-quality mock data for fallback
const MOCK_PRODUCTS = [
  { id: '1', sku: 'CEM-BAM-50', name: 'Bamburi Tembo Cement (50kg)', category: 'Cement', unit: 'Bag', unitPrice: 950, stockLevel: 45, minStockLevel: 10 },
  { id: '2', sku: 'STL-D12-6M', name: 'D12 Deformed Steel Bar (6m)', category: 'Steel', unit: 'Pc', unitPrice: 1250, stockLevel: 30, minStockLevel: 10 },
  { id: '3', sku: 'ROF-BOX-3M', name: 'Box Profile Sheet - Blue (3m)', category: 'Roofing', unit: 'Pc', unitPrice: 1800, stockLevel: 15, minStockLevel: 5 },
  { id: '4', sku: 'PNT-CRW-WHT-4', name: 'Crown Vinyl Matt White (4L)', category: 'Paint', unit: 'Tin', unitPrice: 2400, stockLevel: 25, minStockLevel: 5 },
  { id: '5', sku: 'PLM-PVC-1/2', name: 'PVC Pipe 1/2-inch (PN10)', category: 'Plumbing', unit: 'Pc', unitPrice: 450, stockLevel: 100, minStockLevel: 20 },
  { id: '6', sku: 'ELE-WIR-1.5B', name: 'Electrical Wire 1.5mm Blue', category: 'Electrical', unit: 'Roll', unitPrice: 3200, stockLevel: 12, minStockLevel: 5 }
];

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
    
    if (!products || products.length === 0) {
       return NextResponse.json(MOCK_PRODUCTS);
    }
    
    return NextResponse.json(products);
  } catch (error) {
    console.error("Products API Fallback engaged:", error);
    return NextResponse.json(MOCK_PRODUCTS);
  }
}
