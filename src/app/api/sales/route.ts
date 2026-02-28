import { prisma } from "@/lib/db";
import { etims } from "@/lib/etims";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cart, paymentMethod, mpesaCode, customerId, total, taxAmount } = body;

    // 1. Create the Sale in Database
    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          invoiceNumber: `INV-${Date.now()}`,
          total,
          taxAmount,
          paymentMethod,
          mpesaCode,
          customerId,
          status: 'COMPLETED',
          saleItems: {
            create: cart.map((item: any) => ({
              productId: item.id,
              quantity: item.qty,
              unitPrice: item.unitPrice,
              subtotal: item.qty * item.unitPrice
            }))
          }
        },
        include: {
          saleItems: true
        }
      });

      // 2. Adjust Stock Levels
      for (const item of cart) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stockLevel: {
              decrement: item.qty
            }
          }
        });
      }

      // 3. Update Customer Debt if Credit
      if (paymentMethod === 'CREDIT' && customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            debtBalance: {
              increment: total
            }
          }
        });
      }

      return newSale;
    });

    // 4. Trigger eTIMS Signing (Mock)
    const etimsResponse = await etims.signInvoice(sale);
    
    if (etimsResponse.success) {
      await prisma.sale.update({
        where: { id: sale.id },
        data: {
          etimsSigned: true,
          etimsSignature: etimsResponse.signature
        }
      });
    }

    return NextResponse.json({ success: true, sale });
  } catch (error: any) {
    console.error("Sale error:", error);
    return NextResponse.json({ error: error.message || "Failed to process sale" }, { status: 500 });
  }
}
