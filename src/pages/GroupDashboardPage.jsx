import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import FloatingButton from "../components/FloatingButton";
export default function GroupDashboardPage() {
  const { id: groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroupData = useCallback(async () => {
    setLoading(true); // Nên đặt ở đầu để có phản hồi tải
    setError(null); // Reset lỗi trước mỗi lần fetch
    try {
      // Lấy thông tin cơ bản của nhóm
      const resGroup = await fetch(`http://localhost:3000/api/auth/${groupId}`); // Giả sử API này lấy tên nhóm, mô tả,...
      if (!resGroup.ok) {
        const errorData = await resGroup.json().catch(() => ({})); // Cố gắng đọc lỗi JSON
        throw new Error(
          errorData.message ||
            `Lấy thông tin nhóm thất bại, status: ${resGroup.status}`
        );
      }
      const groupDetails = await resGroup.json();

      // Lấy số dư TỔNG THỰC TẾ của nhóm bằng API mới
      const resActualBalance = await fetch(
        `http://localhost:3000/api/auth/groups/${groupId}/actual-balance` // <<<< API LẤY SỐ DƯ MỚI
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

      // Cập nhật state với thông tin nhóm và số dư thực tế
      setGroupInfo({
        ...groupDetails, // Giữ lại thông tin nhóm từ API đầu tiên
        balance: actualBalanceData.balance, // Gán số dư thực tế
      });

      // Fetch categories nếu cần thiết cho trang này
      const resCats = await fetch(`http://localhost:3000/api/auth/categories`);
      if (!resCats.ok) throw new Error(`Categories status ${resCats.status}`);
      const catData = await resCats.json();
      setCategories(catData);
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu nhóm:", err);
      setError(err.message || "Không thể tải dữ liệu nhóm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [groupId]); // Phụ thuộc vào groupId

  useEffect(() => {
    if (groupId && groupId !== "settings") {
      // Kiểm tra groupId hợp lệ
      fetchGroupData();
    }
  }, [groupId, fetchGroupData]);

  const handleCategoryClick = (cat) => {
    alert(`Bạn đã chọn danh mục: ${cat.name}`);
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Thanh trạng thái */}
      <div className="bg-white shadow -mt-4 mx-4 rounded-xl p-4 flex justify-between text-sm font-medium">
        <div>Đã chi: {groupInfo?.totalSpent?.toLocaleString() || 0} đ</div>
        <div className="text-center text-purple-600 font-semibold">
          {groupInfo?.name || "Tên nhóm"}
        </div>
        <div>
          Số dư nhóm:{" "}{loading ? "Đang tải..." : groupInfo?.balance?.toLocaleString() || 0}{" "}đ
        </div>
      </div>

      {/* Danh mục */}
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

        {/* Ghi chú nếu chưa có dữ liệu */}
        <div className="text-center text-sm text-gray-500 mt-10">
          <p>Bạn chưa có ghi chép nào!</p>
          <p className="text-blue-500">
            Hãy chạm vào đây và kéo xuống để hiển thị dữ liệu mới nhất!
          </p>
        </div>
      </div>

      <FloatingButton groupId={groupId} onSuccess={fetchGroupData} />
    </div>
  );
}
