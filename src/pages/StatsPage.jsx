import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import BalanceLineChart from "../components/BalanceLineChart";

import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);

// helper nhỏ
const cn = (...classes) => classes.filter(Boolean).join(" ");

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
      })
      .catch(() => setLoading(false));
  }, [userId]);

  // Fetch danh sách danh mục chi tiêu
  useEffect(() => {
    fetch(`http://localhost:3000/api/admin/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
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
      .then((data) => setPieSummaryThisMonth(data))
      .catch(() => setPieSummaryThisMonth(null));

    // Tháng trước
    fetch(
      `http://localhost:3000/api/auth/expenses/personal/monthly-summary/${userId}?month=${yyyyMM(
        lastMonth
      )}`
    )
      .then((res) => res.json())
      .then((data) => setPieSummaryLastMonth(data))
      .catch(() => setPieSummaryLastMonth(null));
  }, [userId]);

  // Biểu đồ biến động số dư hôm nay (Cá nhân / Nhóm)
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
          labels,
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
        const dataPoints = [0];

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
          labels,
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

  // Tổng chi hôm nay theo danh mục
  const categoriesWithSpent = useMemo(() => {
    if (!categories.length || !transactions.length) {
      return [];
    }

    // Xác định ngày hôm nay bên trong useMemo để không phải đưa 'now' vào deps
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    return categories.map((cat) => {
      const spentAmount = transactions
        .filter((tx) => {
          const txDateStr = new Date(tx.transaction_date)
            .toISOString()
            .slice(0, 10);
          if (txDateStr !== todayStr) return false;

          if (mainTab === "Cá nhân" && tx.group_id) return false;
          if (
            mainTab === "Nhóm" &&
            (!tx.group_id ||
              tx.transaction_type?.toLowerCase() !== "groupexpense")
          ) {
            if (tx.transaction_type?.toLowerCase() !== "groupexpense")
              return false;
          }

          const txCategoryId =
            typeof tx.category_id === "object" && tx.category_id !== null
              ? tx.category_id._id
              : tx.category_id;
          if (txCategoryId !== cat._id) return false;

          let isSpendingTransaction = false;
          const type = tx.transaction_type?.toLowerCase();

          if (mainTab === "Cá nhân") {
            if (
              type === "expense" ||
              type === "withdraw" ||
              (type === "contribution" && tx.group_id)
            ) {
              isSpendingTransaction = true;
            }
          } else if (mainTab === "Nhóm") {
            if (type === "groupexpense") {
              isSpendingTransaction = true;
            }
          }
          return isSpendingTransaction;
        })
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);

      return { ...cat, spent: spentAmount };
    });
  }, [transactions, categories, mainTab]);
  const now = new Date();
  const pieColors = [
    "#60a5fa",
    "#1d4ed8",
    "#f59e42",
    "#ef4444",
    "#a78bfa",
    "#f472b6",
    "#a16207",
  ];

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

  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const totalToday = categoriesWithSpent.reduce(
    (sum, cat) => sum + cat.spent,
    0
  );

  const isPersonal = mainTab === "Cá nhân";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">Thống kê</h1>
          <div className="w-10" />
        </div>

        {/* Tabs Cá nhân / Nhóm */}
        <div className="px-4 pb-3">
          <div className="bg-white rounded-full p-1 shadow-sm flex gap-1">
            <button
              className={cn(
                "flex-1 py-1.5 text-sm font-medium rounded-full transition-all",
                isPersonal
                  ? "bg-purple-100 text-purple-700 shadow"
                  : "text-gray-500 hover:bg-gray-100"
              )}
              onClick={() => setMainTab("Cá nhân")}
            >
              Cá nhân
            </button>
            <button
              className={cn(
                "flex-1 py-1.5 text-sm font-medium rounded-full transition-all",
                !isPersonal
                  ? "bg-blue-100 text-blue-700 shadow"
                  : "text-gray-500 hover:bg-gray-100"
              )}
              onClick={() => setMainTab("Nhóm")}
            >
              Nhóm
            </button>
          </div>
        </div>
      </div>

      {/* Line chart card */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="mb-3 text-center">
            <p className="text-xs text-gray-500">
              {isPersonal
                ? "Biến động số dư cá nhân hôm nay"
                : "Biến động quỹ nhóm hôm nay"}
            </p>
          </div>
          {loading ? (
            <div className="text-center text-gray-500 py-10">Đang tải...</div>
          ) : balanceChartData ? (
            <BalanceLineChart chartData={balanceChartData} />
          ) : (
            <div className="text-center text-gray-400 py-10">
              Không có dữ liệu biểu đồ.
            </div>
          )}
        </div>
      </div>

      {/* Card dưới: Chi tiêu / Biểu đồ */}
      <div className="mt-4 mx-0">
        <div className="bg-white rounded-t-3xl shadow-lg pt-3 pb-24">
          {/* Inner tabs: Chi tiêu / Biểu đồ */}
          <div className="flex justify-between px-4 border-b">
            <button
              className={cn(
                "pb-3 px-4 text-sm font-medium",
                tab === "Chi tiêu"
                  ? "text-purple-600 border-b-2 border-purple-500"
                  : "text-gray-500"
              )}
              onClick={() => setTab("Chi tiêu")}
            >
              Chi tiêu
            </button>
            <button
              className={cn(
                "pb-3 px-4 text-sm font-medium",
                tab === "Biểu đồ"
                  ? "text-purple-600 border-b-2 border-purple-500"
                  : "text-gray-500"
              )}
              onClick={() => setTab("Biểu đồ")}
            >
              Biểu đồ
            </button>
          </div>

          {/* Tab Chi tiêu */}
          {tab === "Chi tiêu" && (
            <div className="px-4 mt-3 space-y-2">
              <h3 className="text-sm font-medium text-gray-800 mb-3">
                Chi tiêu hôm nay theo danh mục{" "}
                <span
                  className={isPersonal ? "text-purple-600" : "text-blue-600"}
                >
                  ({isPersonal ? "Cá nhân" : "Nhóm"})
                </span>
              </h3>

              {categoriesWithSpent.map((cat) => (
                <div
                  key={cat._id}
                  className="flex items-center justify-between py-3 border-b last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-2xl">
                      {cat.icon || "📁"}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {cat.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        Mức dự chi:{" "}
                        {cat.limit
                          ? `${cat.limit.toLocaleString()} đ`
                          : "Không giới hạn"}
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "font-semibold text-sm",
                      cat.spent > 0 ? "text-red-600" : "text-gray-500"
                    )}
                  >
                    {cat.spent > 0 ? "-" : ""}
                    {cat.spent ? cat.spent.toLocaleString() : 0} đ
                  </div>
                </div>
              ))}

              {categoriesWithSpent.length === 0 && (
                <div className="text-center text-xs text-gray-400 py-6">
                  Không có dữ liệu chi tiêu hôm nay.
                </div>
              )}
            </div>
          )}

          {/* Tab Biểu đồ */}
          {tab === "Biểu đồ" && (
            <div className="px-4 mt-3 space-y-5">
              {/* Tháng này */}
              <div className="bg-gradient-to-b from-blue-50 to-purple-50 rounded-2xl p-4">
                <div className="font-semibold text-center mb-3 text-sm">
                  Chi tiêu tháng {now.getMonth() + 1}-{now.getFullYear()} (
                  {pieSummaryThisMonth?.total?.toLocaleString() || 0} đ)
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-40 h-40 mx-auto">
                    {pieDataThisMonth ? (
                      <Pie
                        data={pieDataThisMonth}
                        options={{
                          plugins: { legend: { display: false } },
                          maintainAspectRatio: false,
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">
                        Không có dữ liệu
                      </div>
                    )}
                  </div>
                  <div className="text-xs space-y-1">
                    {pieSummaryThisMonth?.summary.map((item, idx) => (
                      <div
                        key={item.category_id}
                        className="flex items-center gap-2"
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
              <div className="bg-gradient-to-b from-slate-50 to-gray-50 rounded-2xl p-4 mb-4">
                <div className="font-semibold text-center mb-3 text-sm">
                  Chi tiêu tháng {lastMonth.getMonth() + 1}-
                  {lastMonth.getFullYear()} (
                  {pieSummaryLastMonth?.total?.toLocaleString() || 0} đ)
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-40 h-40 mx-auto">
                    {pieDataLastMonth ? (
                      <Pie
                        data={pieDataLastMonth}
                        options={{
                          plugins: { legend: { display: false } },
                          maintainAspectRatio: false,
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">
                        Không có dữ liệu
                      </div>
                    )}
                  </div>
                  <div className="text-xs space-y-1">
                    {pieSummaryLastMonth?.summary.map((item, idx) => (
                      <div
                        key={item.category_id}
                        className="flex items-center gap-2"
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
      </div>

      {/* Tổng chi tiêu hôm nay */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm py-3 px-4">
        <div className="text-center">
          <span className="text-sm text-gray-500">
            Tổng chi tiêu hôm nay ({isPersonal ? "cá nhân" : "nhóm"}):{" "}
          </span>
          <span className="text-lg font-bold text-red-600">
            {totalToday.toLocaleString()} đ
          </span>
        </div>
      </div>
    </div>
  );
}
