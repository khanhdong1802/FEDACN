import React, { useEffect, useState } from "react";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

const defaultCards = [
  {
    key: "spendingToday",
    icon: TrendingDown,
    label: "Chi tiêu hôm nay",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    key: "savings",
    icon: TrendingUp,
    label: "Tiết kiệm được",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    key: "budgetRemaining",
    icon: Wallet,
    label: "Ngân sách còn lại",
    gradient: "from-violet-500 to-purple-500",
  },
];

const formatCurrency = (v) =>
  typeof v === "number"
    ? new Intl.NumberFormat("vi-VN").format(v) + "đ"
    : v ?? "0đ";

const StatsCards = ({ userId: propUserId }) => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userId =
    propUserId ||
    (() => {
      try {
        const u = JSON.parse(localStorage.getItem("user"));
        return u?._id;
      } catch {
        return null;
      }
    })();

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";
    const token = localStorage.getItem("accessToken");

    // Cập nhật API URL
    fetch(`${API_BASE}/api/auth/stats/overview/${userId}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        if (data?.success && data?.stats) {
          setStatsData(data.stats);
        } else {
          setError("Không có dữ liệu");
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Stats fetch error:", err);
        setError("Không thể tải dữ liệu");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [userId]);

  if (!userId) {
    return (
      <div className="px-4 mb-8">
        <p className="text-sm text-red-500">Không tìm thấy userId</p>
      </div>
    );
  }

  return (
    <div className="px-4 mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Thống kê</h2>

      {loading && <p className="text-sm text-gray-500">Đang tải...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-3">
        {defaultCards.map((card, index) => {
          const stat = statsData ? statsData[card.key] : null;
          const value =
            card.key === "budgetRemaining" && stat?.percentRemaining != null
              ? `${stat.percentRemaining}%`
              : formatCurrency(stat?.value ?? 0);
          const trend =
            stat?.trend ??
            (card.key === "budgetRemaining"
              ? stat?.percentRemaining != null
                ? `${stat?.percentRemaining}%`
                : "0%"
              : "+0%");
          const trendUp = stat?.trendUp ?? true;
          const Icon = card.icon;

          return (
            <div
              key={card.key}
              className="glass-card rounded-3xl p-4 hover:shadow-elevation transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`bg-gradient-to-br ${card.gradient} w-12 h-12 rounded-2xl flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                    <p className="text-lg font-bold text-gray-800">{value}</p>
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    trendUp
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {trend}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsCards;
