import React from "react";
import CategoryCard from "../components/CategoryCard";
import FloatingButton from "../components/FloatingButton";

export default function DashboardPage() {
  const categories = [
    { icon: "🏠", label: "Tiền nhà" },
    { icon: "🍱", label: "Thức ăn" },
    { icon: "🎓", label: "Học phí" },
    { icon: "🚌", label: "Đi lại" },
    { icon: "📱", label: "Đồ dùng" },
    { icon: "💤", label: "Tiền ngủ" },
  ];

  // Hàm xử lý khi click vào Category
  const handleCategoryClick = (label) => {
    alert(`Bạn đã chọn danh mục: ${label}`);
    // TODO: sau này có thể điều hướng hoặc mở modal ở đây
  };

  return (
    <div className="min-h-screen bg-white relative">
      <div className="px-4 mt-4">
        {/* Danh mục chi tiêu */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {categories.map((cat, idx) => (
            <CategoryCard
              key={idx}
              icon={cat.icon}
              label={cat.label}
              onClick={() => handleCategoryClick(cat.label)}
            />
          ))}
        </div>

        {/* Thông báo chưa có ghi chép */}
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
