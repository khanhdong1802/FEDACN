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
  const [visibleCount, setVisibleCount] = useState(4);

  // Fetch danh mục
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/categories");
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
              {transactionHistory.slice(0, visibleCount).map((tx) => (
                <div
                  key={tx._id}
                  className="flex items-start gap-3 p-4 rounded-xl shadow-sm bg-white border border-gray-100"
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-white ${
                      tx.amount > 0 ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : "-"}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800 capitalize">
                        {tx.transaction_type}
                      </span>
                      <span
                        className={`font-semibold ${
                          tx.amount > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount.toLocaleString()} đ
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Ngày:{" "}
                      {tx.transaction_date
                        ? new Date(tx.transaction_date).toLocaleDateString(
                            "vi-VN"
                          )
                        : ""}
                      {tx.description && (
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
              ))}

              {/* Nút "Xem thêm" và "Thu gọn" */}
              {visibleCount < transactionHistory.length ? (
                <div className="text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 4)}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    Xem thêm
                  </button>
                </div>
              ) : transactionHistory.length > 4 ? (
                <div className="text-center">
                  <button
                    onClick={() => setVisibleCount(4)}
                    className="text-gray-500 hover:underline text-sm font-medium"
                  >
                    Thu gọn
                  </button>
                </div>
              ) : null}
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
