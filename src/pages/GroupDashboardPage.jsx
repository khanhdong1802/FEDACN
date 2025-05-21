import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import FloatingButton from "../components/FloatingButton";

export default function GroupDashboardPage() {
  const { id: groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const resGroup = await fetch(
          `http://localhost:3000/api/auth/${groupId}`
        );
        if (!resGroup.ok) throw new Error(`Group status ${resGroup.status}`);
        const groupData = await resGroup.json();
        setGroupInfo(groupData);

        // Lấy tất cả danh mục (vì backend chưa có route theo group)
        const resCats = await fetch(
          `http://localhost:3000/api/auth/categories`
        );
        if (!resCats.ok) throw new Error(`Categories status ${resCats.status}`);
        const catData = await resCats.json();
        setCategories(catData);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu nhóm:", err);
        setError("Không thể tải dữ liệu nhóm");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

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
        <div>Số dư: {groupInfo?.balance?.toLocaleString() || 0} đ</div>
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

      <FloatingButton groupId={groupId} />
    </div>
  );
}
