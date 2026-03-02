import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, physicalStock, reason } = body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current system stock
      const product = await tx.product.findUnique({
        where: { id: productId }
      });

      if (!product) throw new Error("Product not found");

      const systemStock = product.stockLevel;
      const variance = physicalStock - systemStock;

      // 2. Create Audit Log
      const audit = await tx.stockAudit.create({
        data: {
          productId: productId,
          systemStock: systemStock,
          physicalStock: physicalStock,
          variance: variance,
          reason: reason || "Manual Audit Reconciliation",
          auditDate: new Date()
        }
      });

      // 3. Reconcile Stock Level (Set system level to reality)
      await tx.product.update({
        where: { id: productId },
        data: { stockLevel: physicalStock }
      });

      return audit;
    });

    return NextResponse.json({ success: true, audit: result });
  } catch (error) {
    console.error("Audit Error:", error);
    return NextResponse.json({ success: false, error: "Audit reconciliation failed" }, { status: 500 });
  }
}

export async function GET() {
   try {
      const audits = await prisma.stockAudit.findMany({
         include: { product: true },
         orderBy: { auditDate: 'desc' }
      });
      return NextResponse.json(audits);
   } catch (error) {
      return NextResponse.json([]);
   }
}
