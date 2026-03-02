import { prisma, dbConnected } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEMO_SETTINGS = {
  name: "KENYA HARDWARE PRO",
  pinNumber: "P051234567X",
  address: "Main Street, Nairobi, Kenya",
  phone: "+254 700 000 000"
};

export async function GET() {
  if (!dbConnected) return NextResponse.json(DEMO_SETTINGS);
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
    const settings = await prisma.businessSettings.upsert({
      where: { id: 'singleton' },
      update: body,
      create: { ...body, id: 'singleton' }
    });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
