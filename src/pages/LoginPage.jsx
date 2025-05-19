import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

      const { message, accessToken, user } = res.data;

      alert(message);
      localStorage.setItem("token", accessToken); // Lưu token JWT
      localStorage.setItem("user", JSON.stringify(user)); // Lưu thông tin user
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi đăng nhập");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center px-4 py-10 pt-16">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
        Chào mừng quay trở lại!
      </h2>
      <p className="mb-6 text-sm text-gray-300">Đăng nhập để tiếp tục</p>

      <div className="w-full max-w-md bg-[#111827] p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold mb-4">Đăng nhập</h3>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="password">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full px-4 py-2 pr-10 rounded bg-gray-800 text-white focus:outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-sm text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 px-4 rounded"
          >
            Đăng nhập
          </button>
        </form>

        <div className="mt-4 text-sm text-center text-gray-400">
          Bạn chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-400 hover:underline">
            Tạo tài khoản ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
