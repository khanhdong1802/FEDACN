import React, { useState } from "react";
import { X } from "lucide-react";

const suggestedAmounts = [1000000, 3000000, 6000000, 12000000];
const suggestedDurations = [1, 3, 6, 12];

export default function SpendingLimitModal({ userId, onClose }) {
  const [amount, setAmount] = useState(0);
  const [months, setMonths] = useState(1);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSuggestAmount = (value) => setAmount(value);
  const handleSuggestMonths = (value) => setMonths(value);

  const handleSave = async () => {
    if (!amount || amount <= 0) return setError("Số tiền không hợp lệ");
    setSaving(true);
    setError(null);

    // Thêm dòng này để debug
    console.log({ userId, amount, months, note });

    try {
      const res = await fetch(
        "http://localhost:3000/api/auth/spending-limits",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            amount,
            months,
            note,
          }),
        }
      );

      if (!res.ok) throw new Error(`Lỗi ${res.status}`);
      onClose();
    } catch (err) {
      console.error("❌ Lỗi lưu hạn mức:", err);
      setError("Không thể lưu hạn mức");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-4 max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <button onClick={onClose}>
            <X size={24} />
          </button>
          <h1 className="text-lg font-medium">Thiết lập hạn mức</h1>
          <button
            onClick={handleSave}
            className="text-purple-600 font-medium"
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label className="text-sm font-medium">Số tiền hạn mức</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-2 border rounded text-sm"
              placeholder="VD: 1,000,000"
            />
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {suggestedAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleSuggestAmount(amt)}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs"
                >
                  {amt.toLocaleString()} đ
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Thời hạn</label>
            <div className="flex gap-2">
              {suggestedDurations.map((m) => (
                <button
                  key={m}
                  onClick={() => handleSuggestMonths(m)}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    months === m
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {m} tháng
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Ghi chú (tuỳ chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2 border rounded text-sm"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
