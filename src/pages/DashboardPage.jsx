import React, { useEffect, useState } from "react";
import CategoryCard from "../components/CategoryCard";
import RecordModal from "../components/RecordModal";
import FloatingButton from "../components/FloatingButton";

export default function DashboardPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // NEW: State cho hiển thị phân trang giao dịch
  const [visibleCount, setVisibleCount] = useState(5);
  const initialVisibleCount = 5;
  const incrementCount = 10;

  // Fetch danh mục
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/admin/categories");
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("❌ Lỗi lấy categories:", err);
        setError("Không load được danh mục");
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  // Khi click vào danh mục
  const handleCategoryClick = (cat) => {
    setSelectedCategoryId(cat._id);
    setShowRecordModal(true);
  };

  const fetchTransactionHistory = async () => {
    console.log("PAGE: fetchTransactionHistory ĐƯỢC GỌI");
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?._id) return;
      const res = await fetch(
        `http://localhost:3000/api/transactions/user/${user._id}`
      );
      if (!res.ok) throw new Error("Không lấy được lịch sử giao dịch");
      const data = await res.json();
      setTransactionHistory(data);
    } catch (err) {
      // Optional: hiển thị lỗi
    }
  };

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  return (
    <div className="min-h-screen bg-white relative">
      <div className="px-4 mt-4">
        {/* Danh mục chi tiêu */}
        {loading && <p className="text-center text-sm">Đang tải...</p>}
        {error && <p className="text-center text-red-500 text-sm">{error}</p>}

        <div className="flex gap-4 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <CategoryCard
              key={cat._id}
              icon={cat.icon || "📁"}
              label={cat.name}
              onClick={() => handleCategoryClick(cat)}
            />
          ))}
        </div>

        {/* Lịch sử giao dịch */}
        {transactionHistory.length === 0 ? (
          <div className="text-center text-sm text-gray-500 mt-10">
            <p>Bạn chưa có ghi chép nào!</p>
            <p className="text-blue-500">
              Hãy chạm vào đây và kéo xuống để hiển thị dữ liệu mới nhất!
            </p>
          </div>
        ) : (
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Giao dịch gần đây
            </h2>
            <div className="space-y-3">
              {transactionHistory.slice(0, visibleCount).map((tx) => {
                // Xác định loại giao dịch để tùy chỉnh hiển thị
                const isIncome = tx.transaction_type === "income";
                const isExpense = tx.transaction_type === "expense";
                const isContribution = tx.transaction_type === "contribution";

                let iconBgClass = "bg-gray-400";
                let iconSign = "";
                let amountColorClass = "text-gray-700";
                let amountPrefix = "";
                const displayAmount = tx.amount;

                if (isIncome) {
                  iconBgClass = "bg-green-500";
                  iconSign = "+";
                  amountColorClass = "text-green-600";
                  amountPrefix = "+ ";
                } else if (isExpense) {
                  iconBgClass = "bg-red-500";
                  iconSign = "-";
                  amountColorClass = "text-red-600";
                  amountPrefix = "- ";
                } else if (isContribution) {
                  // Contribution là tiền đi ra khỏi tài khoản cá nhân
                  iconBgClass = "bg-red-500"; // Hiển thị như một khoản chi
                  iconSign = "-";
                  amountColorClass = "text-red-600";
                  amountPrefix = "- ";
                } else {
                  if (tx.amount >= 0) {
                    // Mặc định coi số dương là thu
                    iconBgClass = "bg-green-500";
                    iconSign = "+";
                    amountColorClass = "text-green-600";
                    amountPrefix = "+ ";
                  } else {
                    // Mặc định số âm là chi (ít khả năng xảy ra nếu amount luôn dương từ API)
                    iconBgClass = "bg-red-500";
                    iconSign = "-";
                    amountColorClass = "text-red-600";
                    amountPrefix = "- ";
                    // displayAmount = Math.abs(tx.amount); // Nếu amount có thể âm từ API
                  }
                }

                return (
                  <div
                    key={tx._id}
                    className="flex items-start gap-3 p-4 rounded-xl shadow-sm bg-white border border-gray-100"
                  >
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full text-xl font-bold text-white ${iconBgClass}`}
                    >
                      {iconSign}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800 capitalize">
                          {tx.description || tx.transaction_type}
                        </span>
                        <span className={`font-semibold ${amountColorClass}`}>
                          {amountPrefix}
                          {displayAmount.toLocaleString()} đ
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {/* ... thông tin ngày, ghi chú, trạng thái ... */}
                        Ngày:{" "}
                        {tx.transaction_date
                          ? new Date(tx.transaction_date).toLocaleDateString(
                              "vi-VN"
                            )
                          : ""}
                        {tx.description &&
                          tx.description !== tx.transaction_type && (
                            <>
                              {" | "}Ghi chú:{" "}
                              <span className="italic">{tx.description}</span>
                            </>
                          )}
                        {tx.status && (
                          <>
                            {" | "}Trạng thái: {tx.status}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Nút "Xem thêm" và "Thu gọn" */}
              {visibleCount < transactionHistory.length && (
                <div className="text-center mt-4">
                  {" "}
                  {/* Thêm margin-top cho nút */}
                  <button
                    onClick={() =>
                      setVisibleCount((prev) => prev + incrementCount)
                    } // THAY ĐỔI: Tăng thêm incrementCount
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    Xem thêm ({incrementCount} mục)
                  </button>
                </div>
              )}

              {/* Chỉ hiển thị "Thu gọn" nếu số lượng đang hiển thị > số lượng ban đầu */}
              {visibleCount > initialVisibleCount &&
                transactionHistory.length > initialVisibleCount && (
                  <div className="text-center mt-2">
                    {" "}
                    {/* Thêm margin-top cho nút */}
                    <button
                      onClick={() => setVisibleCount(initialVisibleCount)} // THAY ĐỔI: Quay về initialVisibleCount
                      className="text-gray-500 hover:underline text-sm font-medium"
                    >
                      Thu gọn
                    </button>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Nút thêm ghi chép */}
      <FloatingButton onSuccess={fetchTransactionHistory} />

      {/* RecordModal */}
      {showRecordModal && (
        <RecordModal
          onClose={() => setShowRecordModal(false)}
          selectedCategoryId={selectedCategoryId}
        />
      )}
    </div>
  );
}
