import React, { useEffect, useState } from "react";
import CategoryCard from "../components/CategoryCard";
import FloatingButton from "../components/FloatingButton";

export default function DashboardPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ------------ Lấy danh mục từ BE ------------ */
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/auth/categories");
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

  const handleCategoryClick = (cat) => {
    alert(`Bạn đã chọn danh mục: ${cat.name}`);
    /* TODO: điều hướng hoặc modal chi tiêu theo cat._id */
  };

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

        {/* Thông báo nếu chưa có ghi chép */}
        <div className="text-center text-sm text-gray-500 mt-10">
          <p>Bạn chưa có ghi chép nào!</p>
          <p className="text-blue-500">
            Hãy chạm vào đây và kéo xuống để hiển thị dữ liệu mới nhất!
          </p>
        </div>
      </div>

      {/* Nút thêm ghi chép */}
      <FloatingButton />
    </div>
  );
}
