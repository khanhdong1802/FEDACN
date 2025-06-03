import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { format, subDays, addDays, isSameDay } from "date-fns";
import vi from "date-fns/locale/vi";

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  // Lấy userId từ localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?._id) setUserId(user._id);
  }, []);

  // Fetch giao dịch theo ngày
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    fetch(
      `http://localhost:3000/api/transactions/user/${userId}?date=${dateStr}`
    )
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data);
        setLoading(false);
      });
  }, [selectedDate, userId]);

  // Tạo mảng 14 ngày xung quanh selectedDate
  const days = [];
  for (let i = -6; i <= 7; i++) {
    days.push(addDays(selectedDate, i));
  }

  // Xuất CSV (giả lập)
  const handleExportCSV = () => {
    alert("Tính năng xuất CSV đang phát triển!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow z-10 flex items-center justify-between px-4 py-3 border-b">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="font-semibold text-lg">
          Lịch sử -{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={handleExportCSV}
          >
            Xuất csv <Download size={16} className="inline" />
          </span>
        </div>
        <Search size={22} className="text-gray-500" />
      </div>

      {/* Thanh chọn ngày */}
      <div className="flex items-center overflow-x-auto px-2 py-2 gap-2 bg-white border-b no-scrollbar">
        <button
          onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          className="p-1"
        >
          <ChevronLeft size={20} />
        </button>
        {days.map((day, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedDate(day)}
            className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer min-w-[60px] text-center ${
              isSameDay(day, selectedDate)
                ? "bg-purple-200 text-purple-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {format(day, "EEE dd/MM", { locale: vi })}
          </div>
        ))}
        <button
          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          className="p-1"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Hiển thị giao dịch */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải...</div>
      ) : (
        <div className="px-3 py-4">
          {transactions.length === 0 ? (
            <div className="text-center text-gray-400">
              Không có giao dịch nào.
            </div>
          ) : (
            transactions.map((tx) => {
              const isContribution = tx.transaction_type === "contribution";
              return (
                <div
                  key={tx._id}
                  className={`mb-3 p-4 rounded-xl shadow-sm ${
                    isContribution ? "bg-purple-400/80" : "bg-teal-300/80"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {/* Chấm tròn giờ bên trái */}
                    <div className="flex flex-col items-center mr-2">
                      <span
                        className={`w-3 h-3 rounded-full block mt-1 ${
                          isContribution ? "bg-purple-500" : "bg-teal-500"
                        }`}
                      ></span>
                      <span className="text-xs text-gray-500 mt-1">
                        {tx.transaction_date
                          ? new Date(tx.transaction_date).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : ""}
                      </span>
                    </div>
                    {/* Nội dung giao dịch */}
                    <div className="flex-1">
                      <div
                        className={`font-semibold ${
                          isContribution ? "text-purple-900" : "text-teal-900"
                        }`}
                      >
                        {tx.user_id?.name || "Không rõ"}{" "}
                        {isContribution
                          ? `- Đóng tiền ${tx.amount?.toLocaleString()} đ`
                          : "- Thêm ghi chép mới"}
                      </div>
                      <div className="text-sm text-gray-700">
                        Ghi chú: {tx.description || "Không có"}
                      </div>
                      {tx.amount && !isContribution && (
                        <div className="text-sm text-gray-700">
                          Tổng tiền: {tx.amount.toLocaleString()} đ
                        </div>
                      )}
                      {/* Ví dụ thêm các trường khác cho ghi chép */}
                      {!isContribution && (
                        <>
                          {tx.category_name && (
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <span>📁 {tx.category_name}</span>
                            </div>
                          )}
                          {tx.group_name && (
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <span>🏠 {tx.group_name}</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-600">
                            Người sử dụng: {tx.user_id?.name}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
