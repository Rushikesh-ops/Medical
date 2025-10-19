import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Sale from "@/models/Sale";

export async function GET() {
  await connectDB();
  const sales = await Sale.find().sort({ date: -1 });
  return NextResponse.json(sales);
}
