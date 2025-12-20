import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
//import CategoryCard from "../components/CategoryCard";
import FloatingButton from "../components/FloatingButton";
import RecordModal from "../components/RecordModal";
import {
  GraduationCap,
  Utensils,
  Bed,
  Home,
  Car,
  Calculator,
} from "lucide-react";

const iconMap = {
  "Học phí": GraduationCap,
  "Thức ăn": Utensils,
  "Tiền ngu": Bed,
  "Tiền nhà": Home,
  "Đi lại": Car,
  "Đồ dùng": Calculator,
};

const gradientMap = {
  "Học phí": "from-purple-500 to-purple-600",
  "Thức ăn": "from-pink-500 to-rose-500",
  "Tiền ngu": "from-blue-500 to-cyan-500",
  "Tiền nhà": "from-orange-500 to-amber-500",
  "Đi lại": "from-cyan-500 to-teal-500",
  "Đồ dùng": "from-indigo-500 to-violet-500",
};

export default function GroupDashboardPage() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const [groupInfo, setGroupInfo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [groupTransactionHistory, setGroupTransactionHistory] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const initialVisibleCount = 5;
  const incrementCount = 10;

  const fetchGroupData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resGroup = await fetch(
        `http://localhost:3000/api/group/${groupId}`
      );
      if (!resGroup.ok) {
        const errorData = await resGroup.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Lấy thông tin nhóm thất bại, status: ${resGroup.status}`
        );
      }
      const groupDetails = await resGroup.json();

      const resActualBalance = await fetch(
        `http://localhost:3000/api/group/groups/${groupId}/actual-balance`
      );
      if (!resActualBalance.ok) {
        const balanceErrorData = await resActualBalance
          .json()
          .catch(() => ({}));
        throw new Error(
          balanceErrorData.message ||
            `Lấy số dư nhóm thất bại, status: ${resActualBalance.status}`
        );
      }
      const actualBalanceData = await resActualBalance.json();

      setGroupInfo({
        ...groupDetails,
        balance: actualBalanceData.balance,
        totalSpent: actualBalanceData.totalSpent,
      });

      const resCats = await fetch(`http://localhost:3000/api/admin/categories`);
      if (!resCats.ok) throw new Error(`Categories status ${resCats.status}`);
      const catData = await resCats.json();
      setCategories(catData);
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu nhóm:", err);
      setError(err.message || "Không thể tải dữ liệu nhóm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const fetchGroupTransactionHistory = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/transactions/group/${groupId}`
      );
      if (!res.ok) throw new Error("Không lấy được lịch sử giao dịch nhóm");
      const data = await res.json();
      setGroupTransactionHistory(data);
    } catch (err) {
      setGroupTransactionHistory([]);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId && groupId !== "settings") {
      fetchGroupData();
      fetchGroupTransactionHistory();
    }
  }, [groupId, fetchGroupData, fetchGroupTransactionHistory]);

  // Reset phân trang khi đổi nhóm
  useEffect(() => {
    setVisibleCount(initialVisibleCount);
  }, [groupId]);

  const handleCategoryClick = (cat) => {
    setSelectedCategoryId(cat._id);
    setShowRecordModal(true);
  };

  return (
    <div className="min-h-screen bg-white relative">
      <div className="bg-white shadow -mt-4 mx-4 rounded-xl p-4 flex justify-between text-sm font-medium">
        <div>Đã chi: {groupInfo?.totalSpent?.toLocaleString() || 0} đ</div>
        <div
          className="text-center text-purple-600 font-semibold cursor-pointer hover:underline"
          onClick={() => navigate(`/groups/${groupId}/members`)}
        >
          {groupInfo?.name || "Tên nhóm"}
        </div>
        <div>
          Số dư nhóm:{" "}
          {loading ? "Đang tải..." : groupInfo?.balance?.toLocaleString() || 0}{" "}
          đ
        </div>
      </div>

      <div className="px-4 mt-6">
        {loading && <p className="text-center text-sm">Đang tải...</p>}
        {error && <p className="text-center text-red-500 text-sm">{error}</p>}

        <div className="grid grid-cols-3 gap-3 pb-2">
          {categories.map((cat, index) => {
            const IconComp = iconMap[cat.name] || Calculator;
            const gradient =
              gradientMap[cat.name] || "from-gray-400 to-gray-500";
            return (
              <button
                key={cat._id}
                className="group glass-card rounded-3xl p-4 hover:shadow-elevation transition-all duration-300 hover:scale-105 active:scale-95 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleCategoryClick(cat)}
              >
                <div
                  className={`bg-gradient-to-br ${gradient} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md group-hover:shadow-glow transition-all group-hover:rotate-6`}
                >
                  <IconComp className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-xs font-semibold text-foreground text-center">
                  {cat.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {showRecordModal && (
        <RecordModal
          onClose={() => setShowRecordModal(false)}
          selectedCategoryId={selectedCategoryId}
        />
      )}

      <FloatingButton
        groupId={groupId}
        onSuccess={() => {
          fetchGroupData();
          fetchGroupTransactionHistory();
        }}
      />

      {/* Lịch sử giao dịch nhóm */}
      {groupTransactionHistory.length === 0 ? (
        <div className="text-center text-sm text-gray-500 mt-10">
          <p>Nhóm chưa có giao dịch nào!</p>
          <p className="text-blue-500">
            Hãy chạm vào danh mục để thêm giao dịch mới cho nhóm!
          </p>
        </div>
      ) : (
        <div className="mt-8 px-4 w-full mx-auto">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            Lịch sử giao dịch nhóm
          </h2>
          <div className="space-y-3">
            {groupTransactionHistory.slice(0, visibleCount).map((tx) => (
              <div
                key={tx._id}
                className="flex items-start gap-3 p-4 rounded-lg shadow-sm bg-white border border-gray-100"
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-white ${
                    tx.transaction_type === "expense"
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                >
                  {tx.transaction_type === "expense" ? "-" : "+"}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800 capitalize">
                      {tx.transaction_type}
                    </span>
                    <span
                      className={`font-semibold ${
                        tx.transaction_type === "expense"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {tx.transaction_type === "expense" ? "-" : "+"}{" "}
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
                    {tx.status && <> | Trạng thái: {tx.status}</>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Nút "Xem thêm" và "Thu gọn" nằm trong khối này */}
          {visibleCount < groupTransactionHistory.length && (
            <div className="text-center mt-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + incrementCount)}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Xem thêm ({incrementCount} mục)
              </button>
            </div>
          )}
          {visibleCount > initialVisibleCount &&
            groupTransactionHistory.length > initialVisibleCount && (
              <div className="text-center mt-2">
                <button
                  onClick={() => setVisibleCount(initialVisibleCount)}
                  className="text-gray-500 hover:underline text-sm font-medium"
                >
                  Thu gọn
                </button>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
