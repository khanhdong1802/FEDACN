import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLoader,
} from "react-icons/fi";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.id]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/register",
        form
      );
      alert(res.data.message || "Đăng ký thành công!");
      localStorage.setItem("token", res.data.acessToken);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi đăng ký");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white overflow-hidden px-4">
      {/* Vầng sáng trang trí + animation */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-16 w-72 h-72 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-80px] left-[-40px] w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-96 border border-emerald-400/10 rounded-full" />
      </div>

      {/* Card đăng ký */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-400/30 mb-3">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Personal Finance App</span>
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Tạo tài khoản mới
          </h1>
          <p className="text-sm text-gray-300">
            Quản lý chi tiêu hiệu quả hơn cùng chúng tôi!
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-7 md:p-8 relative overflow-hidden">
          {/* Viền sáng chạy nhẹ quanh card */}
          <div className="pointer-events-none absolute inset-0 border border-white/5 rounded-2xl" />

          {/* Form */}
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="inline-block w-6 h-[2px] bg-emerald-400 rounded-full" />
            Đăng ký
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ và tên */}
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-200"
              >
                Họ và tên
              </label>
              <div className="relative group">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="text"
                  id="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Họ Tên"
                  className="w-full h-11 pl-9 pr-3 rounded-lg bg-slate-900/60 border border-slate-700/70 text-sm text-white placeholder:text-slate-400 outline-none 
                             focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200"
              >
                Email
              </label>
              <div className="relative group">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="email"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full h-11 pl-9 pr-3 rounded-lg bg-slate-900/60 border border-slate-700/70 text-sm text-white placeholder:text-slate-400 outline-none 
                             focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40 transition-all"
                  required
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-200"
              >
                Mật khẩu
              </label>
              <div className="relative group">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-11 pl-9 pr-10 rounded-lg bg-slate-900/60 border border-slate-700/70 text-sm text-white placeholder:text-slate-400 outline-none 
                             focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Nút đăng ký */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full h-11 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-sm font-medium text-slate-950
                         flex items-center justify-center gap-2
                         shadow-[0_12px_30px_rgba(16,185,129,0.4)]
                         hover:shadow-[0_18px_40px_rgba(16,185,129,0.6)]
                         hover:translate-y-[1px]
                         active:translate-y-[2px] active:shadow-[0_8px_24px_rgba(16,185,129,0.4)]
                         transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-gray-300">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-emerald-300 hover:text-emerald-200 font-medium underline-offset-2 hover:underline transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
