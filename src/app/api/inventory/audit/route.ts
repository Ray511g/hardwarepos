import { prisma, dbConnected } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const globalStore = global as any;
if (!globalStore.simAudits) {
  globalStore.simAudits = [
    { id: '1', product: { sku: 'CEM-BAM-50', name: 'Bamburi Cement' }, systemStock: 250, physicalStock: 248, variance: -2, reason: 'Manual Reconciliation', auditDate: new Date().toISOString() }
  ];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, physicalStock, reason } = body;

    if (!dbConnected) {
       const newAudit = { ...body, id: `sim-${Date.now()}`, auditDate: new Date().toISOString() };
       globalStore.simAudits.push(newAudit);
       return NextResponse.json({ success: true, audit: newAudit });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("Product not found");

      const systemStock = product.stockLevel;
      const variance = physicalStock - systemStock;

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

      await tx.product.update({
        where: { id: productId },
        data: { stockLevel: physicalStock }
      });

      return audit;
    });

    return NextResponse.json({ success: true, audit: result });
  } catch (error) {
    console.error("Audit Error:", error);
    return NextResponse.json({ success: false, simulated: true });
  }
}

export async function GET() {
   if (!dbConnected) return NextResponse.json(globalStore.simAudits);
   try {
      const audits = await prisma.stockAudit.findMany({
         include: { product: true },
         orderBy: { auditDate: 'desc' }
      });
      return NextResponse.json(audits.length > 0 ? audits : globalStore.simAudits);
   } catch (error) {
      return NextResponse.json(globalStore.simAudits);
   }
}
