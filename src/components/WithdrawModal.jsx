import React, { useState } from "react";
import { X } from "lucide-react";

const WithdrawModal = ({ onClose }) => {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!amount || !source) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    alert(`💸 Rút ${amount} đ từ: ${source}\nGhi chú: ${note}`);
    onClose(); // đóng modal sau khi "lưu"
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-4 max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <button onClick={onClose}>
            <X size={24} />
          </button>
          <h1 className="text-lg font-medium">Rút tiền</h1>
          <button
            onClick={handleSubmit}
            className="text-purple-600 font-medium"
          >
            Lưu
          </button>
        </div>

        {/* Form rút tiền */}
        <div className="flex flex-col gap-4">
          <input
            type="number"
            placeholder="Số tiền"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded text-sm"
          />
          <input
            type="text"
            placeholder="Lý do rút (VD: Ăn uống, mua đồ...)"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full p-2 border rounded text-sm"
          />
          <textarea
            placeholder="Ghi chú (tùy chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2 border rounded text-sm"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;
