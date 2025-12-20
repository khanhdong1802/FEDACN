import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header
      id="home"
      className="relative min-h-screen flex items-center pt-24 pb-16"
    >
      {/* Background gradient + blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Text */}
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Ứng dụng quản lý chi tiêu cho sinh viên
          </p>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Quản lý chi tiêu{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              thông minh
            </span>{" "}
            cho từng phòng trọ.
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-xl">
            Ghi chép, chia tiền, thống kê và minh bạch chi tiêu trong nhóm – tất
            cả trong một ứng dụng duy nhất, trực quan và dễ dùng.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 h-11 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-medium text-sm
                         shadow-[0_12px_30px_rgba(16,185,129,0.4)]
                         hover:shadow-[0_18px_40px_rgba(16,185,129,0.6)]
                         hover:translate-y-[1px]
                         active:translate-y-[2px]
                         transition-all"
            >
              Bắt đầu miễn phí
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center px-5 h-11 rounded-lg border border-slate-600/80 text-sm font-medium text-slate-100
                         hover:border-emerald-400 hover:text-emerald-200 hover:bg-slate-900/40 transition-all"
            >
              Đăng nhập
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 text-xs text-slate-400 mt-2">
            <div>
              <span className="font-semibold text-emerald-300">1000+</span> giao
              dịch mỗi tháng
            </div>
            <div>
              <span className="font-semibold text-emerald-300">100%</span> minh
              bạch cho mọi thành viên
            </div>
          </div>
        </div>

        {/* Mockup card / highlight */}
        <div className="hidden md:block">
          <div className="relative max-w-md ml-auto">
            <div className="absolute -top-8 -left-8 w-24 h-24 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 animate-pulse" />
            <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-300">Tổng chi tháng này</p>
                  <p className="text-2xl font-bold text-emerald-300">
                    3.250.000₫
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-400/40">
                  +12% so với tháng trước
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs mb-4">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/70">
                  <p className="text-slate-400 mb-1">Tiền phòng</p>
                  <p className="font-semibold text-slate-100">1.800.000₫</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/70">
                  <p className="text-slate-400 mb-1">Ăn uống</p>
                  <p className="font-semibold text-slate-100">950.000₫</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/70">
                  <p className="text-slate-400 mb-1">Khác</p>
                  <p className="font-semibold text-slate-100">500.000₫</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>4 thành viên trong nhóm</span>
                <span>Chia đều: 812.500₫/người</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
