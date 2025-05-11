import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";

const WithdrawModal = ({ onClose, userId }) => {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");
  const [balance, setBalance] = useState(0); // Lưu số dư của người dùng

  // Gọi hàm fetchBalance khi userId thay đổi
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (!userId) {
          console.warn("⚠️ Không có userId được truyền vào!");
          return;
        }

        const url = `http://localhost:3000/api/auth/balance/${userId}`;
        console.log("📡 Gọi API:", url);
        const res = await fetch(url);

        if (!res.ok) {
          const text = await res.text();
          console.error("❌ Lỗi khi gọi API:", res.status, text);
          return;
        }

        const data = await res.json();
        console.log("📦 Dữ liệu trả về từ API:", data);
        setBalance(data?.balance || 0);
      } catch (err) {
        console.error("Lỗi khi lấy số dư:", err);
      }
    };

    fetchBalance();
  }, [userId]);

  const handleSubmit = async () => {
    if (!amount || !source) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (amount > balance) {
      alert("Số tiền rút vượt quá số dư hiện tại");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/auth/Withdraw", {
        user_id: userId,
        amount,
        source,
        note,
      });

      // Sau khi rút tiền, gọi lại fetchBalance để cập nhật lại số dư mới
      setBalance(balance - Number(amount)); // Cập nhật số dư sau khi rút tiền
      alert(`💸 Rút ${amount} đ từ: ${source}\nGhi chú: ${note}`);
      onClose(); // Đóng modal sau khi thực hiện xong
    } catch (error) {
      console.error("Lỗi khi rút tiền:", error);
      alert("Lỗi khi thực hiện giao dịch rút tiền.");
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
          {/* Hiển thị số dư hiện tại */}
          <div className="text-sm text-gray-600">
            <strong>Số dư hiện tại:</strong> {balance} đ
          </div>

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
