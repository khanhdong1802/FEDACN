import React from "react";
import phoneImage from "../assets/Screenshot 2025-06-11 212308.png";

const StatisticSection = () => {
  return (
    <section className="bg-gradient-to-r from-black to-gray-900 text-white py-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text content */}
        <div>
          <h2 className="text-4xl font-extrabold mb-6">Thống kê chi tiết</h2>
          <p className="text-lg leading-relaxed text-gray-300">
            Từ nay bạn không cần phải lo lắng về việc ghi chép chi tiêu, sau đó
            ngồi cộng trừ tính toán xem mọi người trong phòng tháng vừa rồi đã
            ăn chơi những gì, hết bao nhiêu, ai dùng nhiều ai dùng ít nữa.
          </p>
          <p className="mt-4 text-lg text-gray-300">
            Ứng dụng sẽ giải quyết hết khâu tính toán và thống kê cho bạn theo
            thời gian thực một cách chính xác và rõ ràng đến từng bữa ăn, từng
            thành viên một.
          </p>
        </div>

        {/* Image */}
        <div className="flex justify-center">
          <img
            src={phoneImage}
            alt="Thống kê ứng dụng"
            className="max-w-xs md:max-w-sm rounded-lg shadow-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default StatisticSection;
