import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  quantity: Number,
  expiry: String,
});

const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "name";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 5;

  const query = search
    ? { name: { $regex: search, $options: "i" } }
    : {};

  const items = await Item.find(query)
    .sort(sort === "expiry" ? { expiry: 1 } : { name: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Item.countDocuments(query);

  return NextResponse.json({ items, total });
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const item = await Item.create(body);
  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
  await connectDB();
  const { id } = await req.json();
  await Item.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
