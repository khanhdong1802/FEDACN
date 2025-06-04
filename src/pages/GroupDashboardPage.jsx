import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import FloatingButton from "../components/FloatingButton";
import RecordModal from "../components/RecordModal";

export default function GroupDashboardPage() {
  const { id: groupId } = useParams();
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
      const resGroup = await fetch(`http://localhost:3000/api/auth/${groupId}`);
      if (!resGroup.ok) {
        const errorData = await resGroup.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Lấy thông tin nhóm thất bại, status: ${resGroup.status}`
        );
      }
      const groupDetails = await resGroup.json();

      const resActualBalance = await fetch(
        `http://localhost:3000/api/auth/groups/${groupId}/actual-balance`
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
        <div className="text-center text-purple-600 font-semibold">
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
