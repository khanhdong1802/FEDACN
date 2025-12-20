import React, { useState } from "react";
import { X } from "lucide-react";

// helper nhỏ giống cn()
const cn = (...classes) => classes.filter(Boolean).join(" ");

// mini UI components
const Label = ({ children, className = "", ...props }) => (
  <label
    className={cn("block text-sm font-medium text-gray-800 mb-1", className)}
    {...props}
  >
    {children}
  </label>
);

const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={cn(
      "w-full px-3 py-2 rounded-2xl border border-white/70 bg-white/90 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500",
      className
    )}
  />
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    {...props}
    className={cn(
      "w-full px-3 py-2 rounded-2xl border border-white/70 bg-white/90 text-sm text-gray-900 resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500",
      className
    )}
  />
);

const Button = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={cn(
      "inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold transition-all focus:outline-none",
      className
    )}
  >
    {children}
  </button>
);

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
    if (!amount || amount <= 0) {
      setError("Số tiền không hợp lệ");
      return;
    }
    setSaving(true);
    setError(null);

    console.log({ userId, amount, months, note });

    try {
      const res = await fetch(
        "http://localhost:3000/api/spending-limit/spending-limits",
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

  const quickAmounts = suggestedAmounts.map((v) => ({
    value: v,
    label: v.toLocaleString(),
  }));

  const durations = suggestedDurations.map((m) => ({
    value: m,
    label: `${m} tháng`,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-3xl bg-white/95 border border-white/70 shadow-xl animate-scale-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-white/70 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">Thiết lập hạn mức</h2>
          <Button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "text-white bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600",
              saving && "opacity-60 cursor-not-allowed"
            )}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>

        {/* Content (cuộn được nếu dài) */}
        <div className="px-6 pt-4 pb-5 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
              {error}
            </div>
          )}

          {/* Số tiền hạn mức */}
          <div className="space-y-2 mb-4">
            <Label>Số tiền hạn mức</Label>
            <div className="relative">
              <Input
                type="number"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0"
                className="text-lg pr-10 text-right"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                đ
              </span>
            </div>
          </div>

          {/* Quick amount buttons */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {quickAmounts.map((item) => (
              <button
                key={item.value}
                onClick={() => handleSuggestAmount(item.value)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full transition-colors bg-purple-50 hover:bg-purple-100",
                  amount === item.value && "bg-purple-100 shadow-sm"
                )}
              >
                <span className="text-sm font-medium text-purple-700">
                  {item.label}
                </span>
                <span className="text-xs text-purple-700 ml-1">đ</span>
              </button>
            ))}
          </div>

          {/* Duration selection */}
          <div className="space-y-3 mb-6">
            <Label>Thời hạn</Label>
            <div className="flex gap-2">
              {durations.map((d) => (
                <button
                  key={d.value}
                  onClick={() => handleSuggestMonths(d.value)}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-full transition-all font-medium text-sm",
                    months === d.value
                      ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-glow"
                      : "bg-white/70 border border-white/80 hover:bg-white"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label>Ghi chú (tùy chọn)</Label>
            <Textarea
              placeholder="Ví dụ: Hạn mức chi tiêu 3 tháng tới..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
