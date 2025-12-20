import React from "react";
import phoneImage from "../assets/Screenshot 2025-06-11 212308.png";

const StatisticSection = () => {
  return (
    <section className="relative bg-slate-950 py-20 px-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text content */}
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Thống kê chi tiết{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              theo thời gian thực
            </span>
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-slate-300">
            Không còn cảnh ghi chép bằng giấy, cộng trừ bằng tay rồi tranh cãi
            “ai ăn nhiều hơn”. Mọi khoản chi trong phòng trọ đều được lưu lại,
            phân loại và tổng hợp tự động.
          </p>
          <p className="mt-3 text-base md:text-lg text-slate-300">
            Ứng dụng hiển thị rõ ràng từng bữa ăn, từng hóa đơn, từng thành viên
            – giúp cả nhóm minh bạch và dễ thống nhất.
          </p>

          {/* Stats cards */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
              <p className="text-slate-300">Thời gian cập nhật</p>
              <p className="text-xl font-bold text-emerald-300">Real-time</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3">
              <p className="text-slate-300">Số nhóm đã tạo</p>
              <p className="text-xl font-bold text-slate-50">50+</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3">
              <p className="text-slate-300">Chi tiêu ghi lại</p>
              <p className="text-xl font-bold text-slate-50">10.000+</p>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="flex justify-center md:justify-end">
          <div className="relative">
            <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl rounded-3xl" />
            <img
              src={phoneImage}
              alt="Thống kê ứng dụng"
              className="relative max-w-xs md:max-w-sm rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatisticSection;
