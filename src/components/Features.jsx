import React from "react";

const Features = () => {
  return (
    <section id="features" className="py-20 bg-gray-100">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          Tính Năng Nổi Bật
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">Ghi chép dễ dàng</h3>
            <p>
              Chỉ với một thao tác, bạn có thể ghi lại các khoản chi tiêu của
              mình một cách nhanh chóng và chính xác.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">Thống kê chi tiết</h3>
            <p>
              Ứng dụng cung cấp báo cáo chi tiêu theo thời gian thực, giúp bạn
              theo dõi và quản lý tài chính hiệu quả.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">Quản lý nhóm</h3>
            <p>
              Cho phép tạo và quản lý các nhóm chi tiêu, phù hợp cho các nhóm
              bạn bè hoặc gia đình.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
