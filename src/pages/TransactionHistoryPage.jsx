import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { format, subDays, addDays, isSameDay } from "date-fns";
import vi from "date-fns/locale/vi";

function TransactionHistoryHeader({
  onTabChange,
  onTypeFilterChange,
  currentTab,
  currentType,
}) {
  return (
    <div className="flex flex-col gap-2 bg-white px-4 py-2 border-b">
      <div className="flex gap-2">
        {["Tất cả", "Cá nhân", "Nhóm"].map((tab) => (
          <button
            key={tab}
            className={`px-3 py-1 rounded-full font-medium ${
              currentTab === tab
                ? "bg-purple-200 text-purple-700"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {["Tất cả", "Nạp", "Rút", "Chi tiêu", "Đóng góp"].map((type) => (
          <button
            key={type}
            className={`px-2 py-1 rounded text-xs ${
              currentType === type
                ? "bg-blue-200 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => onTypeFilterChange(type)}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}

function TransactionItem({ tx }) {
  // Xác định loại và màu
  let bg = "bg-gray-100",
    text = "text-gray-800",
    label = "";
  if (tx.transaction_type === "income") {
    bg = "bg-green-200/80";
    text = "text-green-900";
    label = "Nạp tiền";
  } else if (tx.transaction_type === "withdraw") {
    bg = "bg-red-200/80";
    text = "text-red-900";
    label = "Rút tiền";
  } else if (tx.transaction_type === "contribution") {
    bg = "bg-purple-400/80";
    text = "text-purple-900";
    label = "Đóng góp nhóm";
  } else if (tx.transaction_type === "groupExpense") {
    bg = "bg-blue-200/80";
    text = "text-blue-900";
    label = "Chi tiêu nhóm";
  }

  return (
    <div className={`mb-3 p-4 rounded-xl shadow-sm ${bg}`}>
      <div className="flex items-start gap-2">
        {/* Chấm tròn giờ bên trái */}
        <div className="flex flex-col items-center mr-2">
          <span
            className={`w-3 h-3 rounded-full block mt-1 ${bg.replace(
              "/80",
              ""
            )}`}
          ></span>
          <span className="text-xs text-gray-500 mt-1">
            {tx.transaction_date
              ? new Date(tx.transaction_date).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>
        {/* Nội dung */}
        <div className="flex-1">
          <div className={`font-semibold ${text}`}>
            {tx.user_id?.name || "Không rõ"} - {label}{" "}
            {tx.amount ? tx.amount.toLocaleString() + " đ" : ""}
          </div>
          <div className="text-sm text-gray-700">
            Ghi chú: {tx.description || "Không có"}
          </div>
          <div className="text-xs text-gray-600 flex gap-2 mt-1">
            {tx.category_name && <>📁 {tx.category_name}</>}
            {tx.group_name && <>🏠 {tx.group_name}</>}
            {tx.source && <>Nguồn: {tx.source}</>}
            {tx.target && <>Đích: {tx.target}</>}
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionList({ transactions, loading }) {
  if (loading)
    return <div className="text-center py-10 text-gray-500">Đang tải...</div>;
  if (!transactions.length)
    return (
      <div className="text-center text-gray-400">Không có giao dịch nào.</div>
    );

  return (
    <div className="px-3 py-4">
      {transactions.map((tx) => (
        <TransactionItem key={tx._id} tx={tx} />
      ))}
    </div>
  );
}

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userId, setUserId] = useState("");
  const [tab, setTab] = useState("Tất cả");
  const [typeFilter, setTypeFilter] = useState("Tất cả");
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

  // Lọc giao dịch theo tab và loại
  const filteredTransactions = transactions.filter((tx) => {
    // Lọc theo tab
    if (tab === "Cá nhân" && tx.group_id) return false;
    if (tab === "Nhóm" && !tx.group_id) return false;
    // Lọc theo loại
    if (
      typeFilter !== "Tất cả" &&
      tx.transaction_type !== typeFilter.toLowerCase()
    )
      return false;
    return true;
  });

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

      {/* Nội dung chính */}
      <div className="px-3 py-4">
        {/* Tabs chọn loại giao dịch */}
        <TransactionHistoryHeader
          onTabChange={setTab}
          onTypeFilterChange={setTypeFilter}
          currentTab={tab}
          currentType={typeFilter}
        />

        {/* Hiển thị giao dịch */}
        <TransactionList
          transactions={filteredTransactions}
          loading={loading}
        />
      </div>
    </div>
  );
}
