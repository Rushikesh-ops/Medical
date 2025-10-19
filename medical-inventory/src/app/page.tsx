"use client";

import SellModal from "@/components/SellModal";
import { useEffect, useState } from "react";

type Item = {
  _id?: string;
  name: string;
  category: string;
  quantity: number;
  expiry: string;
  price: number;
};

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<Omit<Item, "_id">>({
    name: "",
    category: "",
    quantity: 0,
    expiry: "",
    price: 0,
  });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [sales, setSales] = useState<any[]>([]);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showSales, setShowSales] = useState(false);

  const limit = 5;

  const [revenue, setRevenue] = useState({ today: 0, month: 0 });

  //Experimental phase *****************************
  async function fetchRevenue() {
    const res = await fetch("/api/revenue");
    const data = await res.json();
    setRevenue(data);
  }

  //Experiment end **********************************

  // Fetch items from backend
  const fetchItems = async () => {
    const res = await fetch(
      `/api/inventory?search=${search}&sort=${sortBy}&page=${page}`
    );
    const data = await res.json();
    setItems(data.items);
    setTotal(data.total);
  };

  useEffect(() => {
    fetchItems();
  }, [search, sortBy, page]);

  //Experimental phase *****************************
  async function handleSell(entries: any[]) {

    console.log("Calling from page" + entries);
    const res = await fetch("/api/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sales: entries }),
    });
    const data = await res.json();
    console.log("Sell Results:", data);
    fetchItems(); // refresh items after selling
  }

  async function fetchSales() {
    const res = await fetch("/api/sales");
    const data = await res.json();
    setSales(data);
  }

  //Experiment end **********************************

  const addItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.expiry) return;

    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });

    setNewItem({ name: "", category: "", quantity: 0, expiry: "" , price: 0});
    fetchItems();
  };

  const deleteItem = async (id?: string) => {
    await fetch("/api/inventory", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchItems();
  };

  const isNearExpiry = (expiry: string) => {
    const daysLeft =
      (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft < 30;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">
        🏥 Bhoskar Medical Inventory
      </h1>

      {/* <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowSellModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Sell Medicines
        </button>
      </div> */}

      <div className="flex justify-between mb-4">
        <button
          onClick={() => setShowSellModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Sell Medicines
        </button>

        <button
          onClick={() => {
            fetchSales();
            setShowSales(!showSales);
          }}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          {showSales ? "Hide Sales" : "View Sales"}
        </button>
      </div>

      <div className="flex gap-4 mt-4 mb-4">
        <button
          onClick={fetchRevenue}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Show Revenue
        </button>

        {revenue.today !== 0 || revenue.month !== 0 ? (
          <div className="flex flex-col text-sm">
            <p>Today’s Revenue: ₹{revenue.today}</p>
            <p>This Month’s Revenue: ₹{revenue.month}</p>
          </div>
        ) : null}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 max-w-4xl mx-auto">
        <input
          type="text"
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-md w-full sm:w-1/2"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded-md"
        >
          <option value="name">Sort by Name</option>
          <option value="expiry">Sort by Expiry</option>
        </select>
      </div>

      {/* Add New Item */}
      <div className="bg-white shadow-md rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Add New Item
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="border p-2 rounded-md"
          />
          <input
            type="text"
            placeholder="Category"
            value={newItem.category}
            onChange={(e) =>
              setNewItem({ ...newItem, category: e.target.value })
            }
            className="border p-2 rounded-md"
          />
          <input
            type="number"
            placeholder="Price"
            value={newItem.price}
            onChange={(e) =>
              setNewItem({ ...newItem, price: Number(e.target.value) })
            }
            className="border p-2 rounded-md"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newItem.quantity}
            onChange={(e) =>
              setNewItem({ ...newItem, quantity: Number(e.target.value) })
            }
            className="border p-2 rounded-md"
          />
          <input
            type="date"
            value={newItem.expiry}
            onChange={(e) => setNewItem({ ...newItem, expiry: e.target.value })}
            className="border p-2 rounded-md"
          />
        </div>
        <button
          onClick={addItem}
          className="mt-4 w-full sm:w-auto bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ Add Item
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-w-5xl mx-auto bg-white shadow-lg rounded-2xl">
        <table className="min-w-full border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">
                Name
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">
                Category
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">
                Price
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">
                Quantity
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">
                Expiry
              </th>
              <th className="py-3 px-4 text-center font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item._id}
                className={`border-b hover:bg-gray-50 transition-colors ${
                  isNearExpiry(item.expiry) ? "bg-red-100" : ""
                }`}
              >
                <td className="py-2 px-4">{item.name}</td>
                <td className="py-2 px-4">{item.category}</td>
                <td className="py-2 px-4">{item.price}</td>
                <td className="py-2 px-4">{item.quantity}</td>
                <td className="py-2 px-4">{item.expiry}</td>
                <td className="py-2 px-4 text-center">
                  <button
                    onClick={() => deleteItem(item._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          ◀ Prev
        </button>
        <span className="text-gray-600 font-medium">
          Page {page} of {Math.ceil(total / limit)}
        </span>
        <button
          disabled={page * limit >= total}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Next ▶
        </button>
      </div>

      {/* SALES HISTORY */}
      {showSales && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Sales History</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Medicine</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, i) => (
                <tr key={i}>
                  <td className="border p-2">{sale.name}</td>
                  <td className="border p-2">{sale.quantity}</td>
                  <td className="border p-2">
                    {new Date(sale.date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showSellModal && (
        <SellModal
          onClose={() => setShowSellModal(false)}
          onSold={handleSell}
        />
      )}
    </div>
  );
}
