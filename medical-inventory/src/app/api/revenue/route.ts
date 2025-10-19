import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Sale from "@/models/Sale";

export async function GET() {
  try {
    await connectDB();
    const now = new Date();

    // Today's range
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // This month's range
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [todaySales, monthSales] = await Promise.all([
      Sale.aggregate([
        { $match: { date: { $gte: startOfDay, $lt: endOfDay } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Sale.aggregate([
        { $match: { date: { $gte: startOfMonth, $lt: endOfMonth } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    return NextResponse.json({
      today: todaySales[0]?.total || 0,
      month: monthSales[0]?.total || 0,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch revenue" }, { status: 500 });
  }
}
