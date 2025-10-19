import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  quantity: Number,
  expiry: String,
  price: Number,
});

export default mongoose.models.Item || mongoose.model("Item", ItemSchema);