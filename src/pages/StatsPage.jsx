import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import BalanceLineChart from "../components/BalanceLineChart";

import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);

export default function StatsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [tab, setTab] = useState("Chi tiêu");
  const [mainTab, setMainTab] = useState("Cá nhân");
  const [balanceChartData, setBalanceChartData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pieSummaryThisMonth, setPieSummaryThisMonth] = useState(null);
  const [pieSummaryLastMonth, setPieSummaryLastMonth] = useState(null);
  const navigate = useNavigate();

  // Lấy userId từ localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?._id) setUserId(user._id);
  }, []);

  // Fetch tất cả giao dịch
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`http://localhost:3000/api/transactions/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data);
        setLoading(false);
      });
  }, [userId]);

  // Fetch danh sách danh mục chi tiêu
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/api/admin/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  // Lấy dữ liệu pie chart từ API cho tháng này và tháng trước
  useEffect(() => {
    if (!userId) return;
    const yyyyMM = (date) => date.toISOString().slice(0, 7);
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Tháng này
    fetch(
      `http://localhost:3000/api/auth/expenses/personal/monthly-summary/${userId}?month=${yyyyMM(
        now
      )}`
    )
      .then((res) => res.json())
      .then((data) => setPieSummaryThisMonth(data));

    // Tháng trước
    fetch(
      `http://localhost:3000/api/auth/expenses/personal/monthly-summary/${userId}?month=${yyyyMM(
        lastMonth
      )}`
    )
      .then((res) => res.json())
      .then((data) => setPieSummaryLastMonth(data));
  }, [userId]);

  // Tính toán dữ liệu biểu đồ biến động số dư cá nhân hôm nay (giữ nguyên)
  useEffect(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (mainTab === "Cá nhân") {
      const filteredPersonal = transactions.filter((tx) => {
        const txDateStr = new Date(tx.transaction_date)
          .toISOString()
          .slice(0, 10);
        return txDateStr === todayStr && !tx.group_id;
      });

      if (filteredPersonal.length > 0) {
        const sortedTx = [...filteredPersonal].sort(
          (a, b) => new Date(a.transaction_date) - new Date(b.transaction_date)
        );
        let currentBalance = 0;
        const labels = ["Đầu ngày"];
        const dataPoints = [0];
        sortedTx.forEach((tx) => {
          let amountChange = 0;
          if (tx.transaction_type === "income") {
            amountChange = tx.amount;
          } else if (
            tx.transaction_type === "expense" ||
            tx.transaction_type === "withdraw"
          ) {
            amountChange = -tx.amount;
          } else if (tx.transaction_type === "contribution" && tx.group_id) {
            amountChange = -tx.amount;
          }
          if (amountChange !== 0) {
            currentBalance += amountChange;
            // Hiển thị giờ thực hiện giao dịch
            const d = new Date(tx.transaction_date);
            labels.push(
              d.toLocaleTimeString("vi-VN", {
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
              label: "Biến động số dư cá nhân hôm nay",
              data: dataPoints,
              fill: true,
              borderColor: "rgb(167, 139, 250)",
              backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                if (!ctx) return null;
                const gradient = ctx.createLinearGradient(
                  0,
                  0,
                  0,
                  context.chart.height * 0.8
                );
                gradient.addColorStop(0, "rgba(167, 139, 250, 0.5)");
                gradient.addColorStop(1, "rgba(167, 139, 250, 0.05)");
                return gradient;
              },
              tension: 0.3,
              pointBackgroundColor: "rgb(139, 92, 246)",
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        });
      } else {
        setBalanceChartData(null);
      }
    } else if (mainTab === "Nhóm") {
      const filtered = transactions.filter((tx) => {
        const txDateStr = new Date(tx.transaction_date)
          .toISOString()
          .slice(0, 10);
        return txDateStr === todayStr && tx.group_id;
      });

      if (filtered.length > 0) {
        const sortedTx = [...filtered].sort(
          (a, b) => new Date(a.transaction_date) - new Date(b.transaction_date)
        );

        let groupBalance = 0;
        const labels = ["Đầu ngày"];
        const dataPoints = [];

        sortedTx.forEach((tx) => {
          let amountChange = 0;
          if (tx.transaction_type === "contribution" && tx.group_id) {
            amountChange = tx.amount;
          } else if (tx.transaction_type === "expense" && tx.group_id) {
            amountChange = -tx.amount;
          }
          if (amountChange !== 0) {
            groupBalance += amountChange;
            const d = new Date(tx.transaction_date);
            labels.push(
              d.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            );
            dataPoints.push(groupBalance);
          }
        });

        setBalanceChartData({
          labels: labels,
          datasets: [
            {
              label: "Biến động quỹ nhóm hôm nay",
              data: dataPoints,
              fill: true,
              borderColor: "rgb(96, 165, 250)",
              backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                if (!ctx) return null;
                const gradient = ctx.createLinearGradient(
                  0,
                  0,
                  0,
                  context.chart.height * 0.8
                );
                gradient.addColorStop(0, "rgba(96, 165, 250, 0.4)");
                gradient.addColorStop(1, "rgba(96, 165, 250, 0.05)");
                return gradient;
              },
              tension: 0.3,
              pointBackgroundColor: "rgb(59, 130, 246)",
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        });
      } else {
        setBalanceChartData(null);
      }
    }
  }, [transactions, mainTab]);

  // Tính tổng chi tiêu theo danh mục hôm nay (giữ nguyên)
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const categoriesWithSpent = categories.map((cat) => {
    const spent = transactions
      .filter(
        (tx) =>
          tx.category_id === cat._id &&
          tx.transaction_type === "expense" &&
          new Date(tx.transaction_date).toISOString().slice(0, 10) === todayStr
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { ...cat, spent };
  });

  // Màu sắc cho các danh mục (tùy chỉnh theo số lượng danh mục)
  const pieColors = [
    "#60a5fa", // Tiền nhà
    "#1d4ed8", // Tiền thức ăn
    "#f59e42", // Học phí
    "#ef4444", // Tiền đi lại
    "#a78bfa", // Tiền đồ dùng
    "#f472b6", // Tiền ngu
    "#a16207", // Phí khác
  ];

  // Dữ liệu cho Pie Chart tháng này
  const pieDataThisMonth = pieSummaryThisMonth
    ? {
        labels: pieSummaryThisMonth.summary.map((item) => item.category_name),
        datasets: [
          {
            data: pieSummaryThisMonth.summary.map((item) => item.total),
            backgroundColor: pieColors,
          },
        ],
      }
    : null;

  // Dữ liệu cho Pie Chart tháng trước
  const pieDataLastMonth = pieSummaryLastMonth
    ? {
        labels: pieSummaryLastMonth.summary.map((item) => item.category_name),
        datasets: [
          {
            data: pieSummaryLastMonth.summary.map((item) => item.total),
            backgroundColor: pieColors,
          },
        ],
      }
    : null;

  // Lấy ngày/tháng năm cho phần tiêu đề
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow z-10 flex items-center justify-between px-4 py-3 border-b">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="font-semibold text-lg">Thống kê</div>
        <div />
      </div>

      {/* Tabs chọn loại thống kê */}
      <div className="flex gap-2 px-4 py-3 bg-white border-b">
        <button
          className={`px-3 py-1 rounded-full font-medium ${
            mainTab === "Cá nhân"
              ? "bg-purple-200 text-purple-700"
              : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => setMainTab("Cá nhân")}
        >
          Cá nhân
        </button>
        <button
          className={`px-3 py-1 rounded-full font-medium ${
            mainTab === "Nhóm"
              ? "bg-blue-200 text-blue-700"
              : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => setMainTab("Nhóm")}
        >
          Nhóm
        </button>
      </div>

      {/* Biểu đồ biến động số dư cá nhân hôm nay */}
      <div className="p-4">
        {loading ? (
          <div className="text-center text-gray-500">Đang tải...</div>
        ) : balanceChartData ? (
          <BalanceLineChart chartData={balanceChartData} />
        ) : (
          <div className="text-center text-gray-400">
            Không có dữ liệu biểu đồ.
          </div>
        )}
      </div>

      <div className="bg-white rounded-t-3xl shadow-lg mt-4">
        {/* Tabs Chi tiêu/Biểu đồ */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 font-semibold text-center ${
              tab === "Chi tiêu"
                ? "text-purple-600 border-b-2 border-purple-500"
                : "text-gray-500"
            }`}
            onClick={() => setTab("Chi tiêu")}
          >
            Chi tiêu
          </button>
          <button
            className={`flex-1 py-3 font-semibold text-center ${
              tab === "Biểu đồ"
                ? "text-purple-600 border-b-2 border-purple-500"
                : "text-gray-500"
            }`}
            onClick={() => setTab("Biểu đồ")}
          >
            Biểu đồ
          </button>
        </div>
        {/* Danh sách chi tiêu theo danh mục */}
        {tab === "Chi tiêu" && (
          <div>
            {categoriesWithSpent.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center px-4 py-3 border-b last:border-b-0"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 mr-3 text-2xl">
                  {cat.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{cat.name}</div>
                  <div className="text-xs text-gray-400">
                    Mức dự chi:{" "}
                    {cat.limit
                      ? cat.limit.toLocaleString() + " đ"
                      : "Không giới hạn"}
                  </div>
                </div>
                <div className="font-semibold text-gray-700">
                  {cat.spent ? cat.spent.toLocaleString() : 0} đ
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Tab "Biểu đồ" dùng dữ liệu từ API */}
        {tab === "Biểu đồ" && (
          <div className="bg-gradient-to-b from-blue-100 to-purple-100 rounded-3xl p-4">
            {/* Tháng này */}
            <div className="mb-6">
              <div className="font-semibold text-center mb-2">
                Chi tiêu tháng {now.getMonth() + 1}-{now.getFullYear()} (
                {pieSummaryThisMonth?.total?.toLocaleString() || 0} đ)
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-40 h-40">
                  {pieDataThisMonth && (
                    <Pie
                      data={pieDataThisMonth}
                      options={{ plugins: { legend: { display: false } } }}
                    />
                  )}
                </div>
                <div>
                  {pieSummaryThisMonth?.summary.map((item, idx) => (
                    <div
                      key={item.category_id}
                      className="flex items-center gap-2 text-sm mb-1"
                    >
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{
                          background: pieColors[idx % pieColors.length],
                        }}
                      ></span>
                      <span>
                        {item.total ? (item.total / 1e6).toFixed(3) : 0} M -{" "}
                        {item.category_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Tháng trước */}
            <div>
              <div className="font-semibold text-center mb-2">
                Chi tiêu tháng {lastMonth.getMonth() + 1}-
                {lastMonth.getFullYear()} (
                {pieSummaryLastMonth?.total?.toLocaleString() || 0} đ)
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-40 h-40">
                  {pieDataLastMonth && (
                    <Pie
                      data={pieDataLastMonth}
                      options={{ plugins: { legend: { display: false } } }}
                    />
                  )}
                </div>
                <div>
                  {pieSummaryLastMonth?.summary.map((item, idx) => (
                    <div
                      key={item.category_id}
                      className="flex items-center gap-2 text-sm mb-1"
                    >
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{
                          background: pieColors[idx % pieColors.length],
                        }}
                      ></span>
                      <span>
                        {item.total ? (item.total / 1e6).toFixed(3) : 0} M -{" "}
                        {item.category_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="font-semibold text-center py-2">
        Tổng chi tiêu hôm nay:{" "}
        {categoriesWithSpent
          .reduce((sum, cat) => sum + cat.spent, 0)
          .toLocaleString()}
        đ
      </div>
    </div>
  );
}
