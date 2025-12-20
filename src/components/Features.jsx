import React from "react";
import { FiEdit3, FiPieChart, FiUsers } from "react-icons/fi";

const Features = () => {
  return (
    <section id="features" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Tính năng nổi bật
          </h2>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto">
            Thiết kế riêng cho sinh viên và người ở trọ – đơn giản nhưng đầy đủ
            những gì bạn cần để kiểm soát chi tiêu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group bg-slate-950/60 border border-slate-700/70 rounded-2xl p-6 hover:border-emerald-400/70 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(16,185,129,0.35)] transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center mb-4">
              <FiEdit3 className="text-emerald-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ghi chép dễ dàng</h3>
            <p className="text-slate-300 text-sm">
              Chỉ vài chạm là bạn có thể thêm một khoản chi tiêu, gắn nhãn, chọn
              người tham gia và để hệ thống tự động chia đều.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-slate-950/60 border border-slate-700/70 rounded-2xl p-6 hover:border-emerald-400/70 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(16,185,129,0.35)] transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/40 flex items-center justify-center mb-4">
              <FiPieChart className="text-indigo-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Thống kê chi tiết</h3>
            <p className="text-slate-300 text-sm">
              Biểu đồ chi tiêu theo ngày, tuần, tháng và theo từng nhóm chi phí,
              giúp bạn nhìn được bức tranh tài chính tổng thể.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-slate-950/60 border border-slate-700/70 rounded-2xl p-6 hover:border-emerald-400/70 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(16,185,129,0.35)] transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/40 flex items-center justify-center mb-4">
              <FiUsers className="text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quản lý nhóm</h3>
            <p className="text-slate-300 text-sm">
              Mời bạn cùng phòng, nhóm bạn hoặc gia đình vào chung một nhóm chi
              tiêu, mỗi người đều xem được số liệu minh bạch.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
