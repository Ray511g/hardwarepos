import { prisma, dbConnected } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let demoSettings = {
  name: "KENYA HARDWARE PRO",
  pinNumber: "P051234567X",
  address: "Main Street, Nairobi, Kenya",
  phone: "0701122334",
  email: "pos@kenyahardware.co.ke",
  paybillNumber: "247247",
  tillNumber: "567890"
};

export async function GET() {
  if (!dbConnected) return NextResponse.json(demoSettings);
  try {
    const settings = await prisma.businessSettings.findFirst({
      where: { id: 'singleton' }
    });
    return NextResponse.json(settings || DEMO_SETTINGS);
  } catch (error) {
    return NextResponse.json(DEMO_SETTINGS);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!dbConnected) {
       demoSettings = { ...demoSettings, ...body };
       return NextResponse.json(demoSettings);
    }
    
    // Clean body for Upsert
    const { id, updatedAt, ...cleanData } = body;
    
    const settings = await prisma.businessSettings.upsert({
      where: { id: 'singleton' },
      update: cleanData,
      create: { ...cleanData, id: 'singleton' }
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings Update Failure:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
