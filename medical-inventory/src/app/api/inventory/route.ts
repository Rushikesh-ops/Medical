import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Item from "@/models/Item";
import Sale from "@/models/Sale";


// const ItemSchema = new mongoose.Schema({
//   name: String,
//   category: String,
//   quantity: Number,
//   expiry: String,
// });

// const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);

// const SaleSchema = new mongoose.Schema({
//   name: String,
//   quantity: Number,
//   date: { type: Date, default: Date.now },
// });

// const Sale = mongoose.models.Sale || mongoose.model("Sale", SaleSchema);




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



export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { sales } = await req.json(); // [{ name: "Paracetamol", quantity: 2 }, ...]

    if (!Array.isArray(sales) || sales.length === 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const results = [];

    for (const sale of sales) {
      const { name, quantity } = sale;
      if (!name || quantity <= 0) continue;

      const item = await Item.findOne({
        name: { $regex: `^${name}$`, $options: "i" },
      });

      if (!item) {
        results.push({ name, status: "not_found" });
        continue;
      }

      if (item.quantity < quantity) {
        results.push({ name, status: "insufficient_stock" });
        continue;
      }

      // Update inventory
      item.quantity -= quantity;
      await item.save();

      // Record sale
      await Sale.create({
        name: item.name,
        quantity,
        price: item.price,
        total: item.price * quantity,
      });

      results.push({ name, status: "success", remaining: item.quantity });
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Sell error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

