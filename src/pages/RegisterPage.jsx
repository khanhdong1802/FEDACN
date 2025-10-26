import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.id]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://bedacn.onrender.com/api/auth/register",
        form
      );
      alert(res.data.message); // Hiển thị thông báo thành công
      localStorage.setItem("token", res.data.acessToken); // Lưu token nếu cần
      navigate("/login"); // Chuyển đến trang đăng nhập
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi đăng ký");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-800 text-white flex flex-col items-center px-4 py-10 pt-16">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
        Tạo tài khoản mới
      </h2>
      <p className="mb-6 text-sm text-gray-300">
        Quản lý chi tiêu hiệu quả hơn cùng chúng tôi!
      </p>

      <div className="w-full max-w-md bg-[#111827] p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold mb-4">Đăng ký</h3>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm mb-1" htmlFor="name">
              Họ và tên
            </label>
            <input
              type="text"
              id="name"
              value={form.name}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
              placeholder="Họ Tên"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={form.email}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
              placeholder="you@example.com"
              onChange={handleChange}
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
                value={form.password}
                className="w-full px-4 py-2 pr-10 rounded bg-gray-800 text-white focus:outline-none"
                placeholder="••••••••"
                onChange={handleChange}
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
            className="w-full bg-green-600 hover:bg-green-700 transition text-white py-2 px-4 rounded"
          >
            Đăng ký
          </button>
        </form>

        <div className="mt-4 text-sm text-center text-gray-400">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
