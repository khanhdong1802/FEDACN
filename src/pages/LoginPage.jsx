import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLoader } from "react-icons/fi";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

      const { message, accessToken, user } = res.data;

      // Nếu tài khoản bị khóa
      if (message === "Tài khoản bị khóa") {
        alert(message);
        return;
      }

      // Check admin
      if (user.email === "admin@gmail.com") {
        localStorage.setItem("isAdmin", "true");
      } else {
        localStorage.setItem("isAdmin", "false");
      }

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi đăng nhập");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:3000/api/auth/google", {
        token: credentialResponse.credential,
      });

      const { accessToken, user } = res.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Google Login failed!");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white overflow-hidden px-4">
      {/* Vầng sáng trang trí + animation */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-16 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-80px] left-[-40px] w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-96 border border-blue-400/10 rounded-full" />
      </div>

      {/* Card login */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-medium border border-blue-400/30 mb-3">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>Chào mừng quay trở lại</span>
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Đăng nhập</h1>
          <p className="text-sm text-gray-300">
            Đăng nhập để tiếp tục quản lý tài chính của bạn.
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-7 md:p-8 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 border border-white/5 rounded-2xl" />

          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="inline-block w-6 h-[2px] bg-blue-400 rounded-full" />
            Đăng nhập tài khoản
          </h2>

          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Email */}
            <div className="space-y-1">
              <label
                className="block text-sm font-medium text-gray-200"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative group">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  id="email"
                  className="w-full h-11 pl-9 pr-3 rounded-lg bg-slate-900/60 border border-slate-700/70 text-sm text-white placeholder:text-slate-400 outline-none 
                             focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40 transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="space-y-1">
              <label
                className="block text-sm font-medium text-gray-200"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <div className="relative group">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full h-11 pl-9 pr-10 rounded-lg bg-slate-900/60 border border-slate-700/70 text-sm text-white placeholder:text-slate-400 outline-none 
                             focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full h-11 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-400 text-sm font-medium text-slate-950
                         flex items-center justify-center gap-2
                         shadow-[0_12px_30px_rgba(59,130,246,0.4)]
                         hover:shadow-[0_18px_40px_rgba(59,130,246,0.6)]
                         hover:translate-y-[1px]
                         active:translate-y-[2px] active:shadow-[0_8px_24px_rgba(59,130,246,0.4)]
                         transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-300">Hoặc</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <div className="scale-95 hover:scale-100 transition-transform">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => alert("Đăng nhập Google thất bại")}
                />
              </div>
            </div>
          </form>

          <div className="mt-5 text-xs text-center text-gray-300">
            Bạn chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-blue-300 hover:text-blue-200 font-medium underline-offset-2 hover:underline transition-colors"
            >
              Tạo tài khoản ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
