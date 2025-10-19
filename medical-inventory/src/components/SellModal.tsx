"use client";
import { useEffect, useState } from "react";

export default function SellModal({ onClose, onSold }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [sales, setSales] = useState<{ name: string; quantity: number }[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const res = await fetch("/api/inventory");
    const data = await res.json();
    setItems(data.items);
  }

  const addSale = () => setSales([...sales, { name: "", quantity: 1 }]);

  const updateSale = (index: number, key: string, value: string | number) => {
    const updated = [...sales];
    (updated[index] as any)[key] = value;
    setSales(updated);
    calculateTotal(updated);
  };

  const calculateTotal = (salesList: any[]) => {
    let totalBill = 0;
    for (const sale of salesList) {
      const item = items.find((i) => i.name === sale.name);
      if (item) totalBill += item.price * (sale.quantity || 0);
    }
    setTotal(totalBill);
  };

  const handleSell = async () => {
    console.log("In sellmodel" + sales);
    // await fetch("/api/inventory", {
    //   method: "PATCH",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(sales),
    // });
    onSold(sales);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-bold mb-4">Sell Medicines</h2>

        {sales.map((sale, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <select
              value={sale.name}
              onChange={(e) => updateSale(i, "name", e.target.value)}
              className="border p-2 flex-1"
            >
              <option value="">Select Medicine</option>
              {items.map((item) => (
                <option key={item._id} value={item.name}>
                  {item.name} (₹{item.price})
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={sale.quantity}
              onChange={(e) => updateSale(i, "quantity", Number(e.target.value))}
              className="border p-2 w-16"
            />
          </div>
        ))}

        <button
          onClick={addSale}
          className="bg-gray-300 text-black px-2 py-1 rounded mb-3 w-full"
        >
          + Add Another
        </button>

        <p className="mb-4 font-semibold text-right">Total Bill: ₹{total}</p>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-3 py-1 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSell}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Confirm Sale
          </button>
        </div>
      </div>
    </div>
  );
}
