"use client";

import { useState } from "react";

export default function SellModal({ onClose, onSell }: any) {
  const [entries, setEntries] = useState([{ name: "", quantity: 1 }]);

  const addRow = () => {
    setEntries([...entries, { name: "", quantity: 1 }]);
  };

  const updateRow = (index: number, field: string, value: any) => {
    const updated = [...entries];
    (updated[index] as any)[field] = value;
    setEntries(updated);
  };

  const handleSell = () => {
    onSell(entries);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Sell Medicines</h2>

        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
          {entries.map((entry, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Medicine name"
                value={entry.name}
                onChange={(e) => updateRow(i, "name", e.target.value)}
                className="border p-2 rounded flex-1"
              />
              <input
                type="number"
                placeholder="Qty"
                value={entry.quantity}
                onChange={(e) =>
                  updateRow(i, "quantity", Number(e.target.value))
                }
                className="border p-2 rounded w-24"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={addRow}
            className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
          >
            + Add Item
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSell}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
