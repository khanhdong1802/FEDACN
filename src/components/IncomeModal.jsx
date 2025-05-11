import React, { useState } from "react";
import { X } from "lucide-react";

const IncomeModal = ({ onClose }) => {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState(""); // Nguồn thu nhập
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false); // Trạng thái loading khi gửi dữ liệu
  const [errorMessage, setErrorMessage] = useState(""); // Lưu trữ thông báo lỗi

  const predefinedSources = ["Lương", "Bán đồ", "Quà", "Khác"];

  // Lấy thông tin người dùng từ localStorage để gửi đi
  const user = JSON.parse(localStorage.getItem("user"));

  const handleSave = async () => {
    if (!amount || !source) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    setErrorMessage(""); // Xóa lỗi trước khi gửi yêu cầu

    try {
      const response = await fetch("http://localhost:3000/api/auth/Income", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?._id, // Dùng _id từ user trong localStorage
          amount: Number(amount), // Chuyển đổi số tiền thành kiểu Number
          source,
          received_date: date, // Ngày nhận tiền
          note,
          status: "pending", // Trạng thái mặc định là pending
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Thu nhập đã được lưu thành công!");
        onClose();

        // Gọi lại API để lấy tổng thu nhập sau khi lưu thành công
        const updatedUser = JSON.parse(localStorage.getItem("user"));
        try {
          const incomeResponse = await fetch(
            `http://localhost:3000/api/income/total/${updatedUser._id}` // ✅ đúng route
          );
          const incomeData = await incomeResponse.json();
          updatedUser.totalIncome = incomeData.total || 0;
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (err) {
          console.error("Lỗi khi lấy tổng thu nhập:", err);
        }
      } else {
        // Nếu có lỗi trả về từ server
        setErrorMessage(result.message || "Đã xảy ra lỗi khi lưu thu nhập");
      }
    } catch (error) {
      console.error("Error saving income:", error);
      setErrorMessage("Đã xảy ra lỗi khi lưu thu nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-2">
          <button onClick={onClose}>
            <X size={24} />
          </button>
          <h1 className="text-lg font-medium">Ghi thu nhập</h1>
          <button
            className="text-purple-600 font-medium"
            onClick={handleSave}
            disabled={loading} // Disable nút khi đang gửi dữ liệu
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
        )}

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Số tiền */}
          <div className="flex justify-between items-center border-b py-2">
            <span className="text-gray-500">Số tiền</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="text-right w-1/2 text-gray-700 outline-none"
            />
          </div>

          {/* Nguồn thu */}
          <div className="flex justify-between items-center border-b py-2">
            <span className="text-gray-500">Nguồn thu</span>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="text-right w-1/2 text-gray-700 outline-none bg-transparent"
            >
              <option value="" disabled>
                Chọn nguồn thu
              </option>
              {predefinedSources.map((src, idx) => (
                <option key={idx} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          {/* Ngày nhận */}
          <div className="flex justify-between items-center border-b py-2">
            <span className="text-gray-500">Ngày nhận</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-gray-700 outline-none"
            />
          </div>

          {/* Ghi chú */}
          <div className="border-b py-2">
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-sm text-gray-700 outline-none"
              placeholder="Ghi chú thêm (nếu có)"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeModal;
