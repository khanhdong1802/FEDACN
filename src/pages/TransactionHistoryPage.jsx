import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { format, subDays, addDays, isSameDay } from "date-fns";
import vi from "date-fns/locale/vi";
import BalanceLineChart from "../components/BalanceLineChart";

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
  let bg = "bg-gray-100", // Màu nền mặc định
    text = "text-gray-800", // Màu chữ mặc định
    label = tx.transaction_type; // Lấy label mặc định từ type

  // Định dạng số tiền và thêm dấu +/-
  let amountDisplay = "";
  if (typeof tx.amount === "number") {
    if (
      tx.transaction_type === "income" ||
      (tx.transaction_type === "contribution" &&
        !tx.group_id) /* Contribution vào quỹ cá nhân (nếu có) */
    ) {
      amountDisplay = `+${tx.amount.toLocaleString()} đ`;
    } else if (
      tx.transaction_type === "withdraw" ||
      tx.transaction_type === "expense" ||
      tx.transaction_type === "groupExpense" ||
      (tx.transaction_type === "contribution" &&
        tx.group_id) /* Contribution vào quỹ nhóm từ cá nhân */
    ) {
      amountDisplay = `-${tx.amount.toLocaleString()} đ`;
    } else {
      // Trường hợp amount có thể âm hoặc dương không rõ ràng từ type
      amountDisplay = `${
        tx.amount > 0 ? "+" : ""
      }${tx.amount.toLocaleString()} đ`;
    }
  }

  // Xác định màu sắc và label cụ thể dựa trên transaction_type
  if (tx.transaction_type === "income") {
    bg = "bg-green-100"; // Sử dụng màu nhạt hơn cho nền
    text = "text-green-700";
    label = tx.description || "Thu nhập"; // Ưu tiên description
  } else if (
    tx.transaction_type === "expense" ||
    tx.transaction_type === "withdraw"
  ) {
    // Gộp "expense" và "withdraw" nếu hiển thị giống nhau
    bg = "bg-red-100"; // Nền đỏ nhạt
    text = "text-red-700"; // Chữ đỏ đậm hơn
    label = tx.description || "Chi tiêu cá nhân";
  } else if (tx.transaction_type === "contribution") {
    // Nếu contribution này là tiền NẠP VÀO NHÓM (từ cá nhân), nó là một khoản chi từ view cá nhân
    // Nhưng nếu đây là trang lịch sử TẤT CẢ, và bạn muốn phân biệt nó thì cần logic rõ hơn
    // Giả sử "contribution" trong TransactionHistory là tiền cá nhân nạp vào nhóm
    bg = "bg-orange-100"; // Ví dụ màu cam cho nạp tiền vào nhóm (chi từ cá nhân)
    text = "text-orange-700";
    label = tx.description || "Đóng góp nhóm";
  } else if (tx.transaction_type === "groupExpense") {
    // Chi tiêu TRỰC TIẾP TỪ QUỸ NHÓM (không ảnh hưởng trực tiếp đến số dư cá nhân đang xem ở đây)
    // Nếu đang xem tab "Tất cả" hoặc "Nhóm" thì mới thấy rõ vai trò
    bg = "bg-sky-100"; // Ví dụ màu xanh da trời cho chi tiêu của nhóm
    text = "text-sky-700";
    label = tx.description || "Chi tiêu nhóm";
  } else {
    // Xử lý các trường hợp không xác định hoặc dựa vào amount nếu cần
    // Ví dụ: nếu amount âm mà type không rõ, có thể cho màu đỏ
    if (tx.amount < 0 && !tx.transaction_type) {
      // Giả sử API có thể trả amount âm
      bg = "bg-red-100";
      text = "text-red-700";
      label = tx.description || "Khoản chi không rõ";
      amountDisplay = `${tx.amount.toLocaleString()} đ`; // amount đã âm
    } else {
      label = tx.description || tx.transaction_type || "Giao dịch khác";
    }
  }

  return (
    <div className={`mb-3 p-3 rounded-lg shadow-sm ${bg}`}>
      {" "}
      {/* Giảm padding nếu cần */}
      <div className="flex items-start">
        {" "}
        {/* Bỏ gap-2 nếu không cần */}
        {/* Chấm tròn giờ và thời gian */}
        <div className="flex flex-col items-center w-16 text-center mr-2">
          {" "}
          {/* Cho chiều rộng cố định */}
          <span
            className={`w-2.5 h-2.5 rounded-full block mt-1.5 ${
              // Lấy màu đậm hơn cho chấm tròn, bỏ /80
              bg.includes("100")
                ? bg.replace("100", "500")
                : bg.replace("/80", "")
            }`}
          ></span>
          <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">
            {" "}
            {/* Chống xuống dòng */}
            {tx.transaction_date
              ? new Date(tx.transaction_date).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>
        {/* Nội dung chính của giao dịch */}
        <div className="flex-1 min-w-0">
          {" "}
          {/* Thêm min-w-0 để xử lý overflow text */}
          <div className={`font-semibold ${text} truncate`}>
            {" "}
            {/* Thêm truncate nếu tên dài */}
            {tx.user_id?.name || "Bạn"} - {label}
          </div>
          <div className={`font-bold ${text} text-lg`}>
            {" "}
            {/* Tăng cỡ chữ số tiền */}
            {amountDisplay}
          </div>
          {/* Thông tin thêm (Category, Group) nếu có */}
          <div className="text-xs text-gray-500 flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
            {tx.category_name && (
              <span className="bg-gray-200 px-1.5 py-0.5 rounded-full">
                📁 {tx.category_name}
              </span>
            )}
            {tx.group_name && (
              <span className="bg-gray-200 px-1.5 py-0.5 rounded-full">
                🏠 {tx.group_name}
              </span>
            )}
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

  //DỮ LIỆU BIỂU ĐỒ
  const [balanceChartData, setBalanceChartData] = useState(null);

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

  useEffect(() => {
    // Chỉ tạo dữ liệu biểu đồ cho tab "Cá nhân" và khi có giao dịch
    if (tab === "Cá nhân" && filteredTransactions.length > 0) {
      // Sắp xếp giao dịch theo thời gian tăng dần
      const sortedTx = [...filteredTransactions].sort(
        (a, b) => new Date(a.transaction_date) - new Date(b.transaction_date)
      );

      let currentBalance = 0; // Bắt đầu số dư từ 0 cho ngày này (hoặc bạn có thể fetch số dư đầu ngày nếu có API)
      const labels = ["Đầu ngày"]; // Điểm bắt đầu
      const dataPoints = [0]; // Số dư tại điểm bắt đầu

      sortedTx.forEach((tx) => {
        let amountChange = 0;
        // Logic xác định thay đổi số dư cá nhân (tương tự DashboardPage)
        if (tx.transaction_type === "income") {
          amountChange = tx.amount;
        } else if (
          tx.transaction_type === "expense" ||
          tx.transaction_type === "withdraw"
        ) {
          amountChange = -tx.amount; // Giao dịch chi tiêu làm giảm số dư
        } else if (tx.transaction_type === "contribution" && tx.group_id) {
          // Đóng góp vào nhóm cũng là chi từ tài khoản cá nhân
          amountChange = -tx.amount;
        }
        // Bỏ qua các loại không ảnh hưởng trực tiếp đến số dư cá nhân như groupExpense từ quỹ nhóm

        if (amountChange !== 0) {
          // Chỉ thêm điểm nếu có thay đổi số dư thực sự
          currentBalance += amountChange;
          labels.push(
            new Date(tx.transaction_date).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
          dataPoints.push(currentBalance);
        }
      });

      setBalanceChartData({
        labels: labels,
        datasets: [
          {
            label: `Biến động số dư ngày ${format(selectedDate, "dd/MM/yyyy")}`,
            data: dataPoints,
            fill: true, // Cho phép tô màu vùng dưới đường line
            borderColor: "rgb(167, 139, 250)", // Màu tím nhạt cho đường line
            backgroundColor: (context) => {
              // Hàm tạo gradient
              const ctx = context.chart.ctx;
              if (!ctx) return null;
              const gradient = ctx.createLinearGradient(
                0,
                0,
                0,
                context.chart.height * 0.8
              ); // Chiều cao gradient
              gradient.addColorStop(0, "rgba(167, 139, 250, 0.5)"); // Màu tím nhạt ở trên
              gradient.addColorStop(1, "rgba(167, 139, 250, 0.05)"); // Trong suốt dần về dưới
              return gradient;
            },
            tension: 0.3, // Độ cong của đường
            pointBackgroundColor: "rgb(139, 92, 246)", // Màu điểm dữ liệu (màu tím đậm hơn)
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      });
    } else {
      setBalanceChartData(null); // Xóa dữ liệu biểu đồ nếu không phải tab "Cá nhân" hoặc không có giao dịch
    }
  }, [filteredTransactions, tab, selectedDate]);

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

        {/* BIỂU ĐỒ */}
        {tab === "Cá nhân" &&
          balanceChartData && ( // Chỉ hiển thị khi ở tab cá nhân và có dữ liệu
            <div className="my-4 bg-white p-2 rounded-lg shadow">
              {" "}
              <BalanceLineChart chartData={balanceChartData} />
            </div>
          )}

        {/* Hiển thị giao dịch */}
        <TransactionList
          transactions={filteredTransactions}
          loading={loading}
        />
      </div>
    </div>
  );
}
