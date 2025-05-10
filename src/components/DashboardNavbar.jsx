import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import avatar from "../assets/avatar.jpg";

const DashboardNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0); // Thêm state số dư

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Lấy thông tin user từ localStorage và gọi API để lấy tổng thu nhập
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Gọi API để lấy tổng thu nhập
      fetch(`http://localhost:3000/api/income/total/${parsedUser._id}`)
        .then((res) => res.json())
        .then((data) => {
          setTotalIncome(data.total || 0); // ✅ cập nhật số dư từ API
        })
        .catch((err) => {
          console.error("Lỗi khi lấy tổng thu nhập:", err);
        });
    }
  }, []); // useEffect chạy lại khi `user` thay đổi

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 pb-6 rounded-b-3xl shadow-md relative">
      <div className="flex justify-between items-center">
        <div
          className="flex items-center gap-4 transition-transform duration-300"
          style={{
            transform: menuOpen ? "translateX(180px)" : "translateX(0)",
          }}
        >
          <button
            className="text-white text-2xl font-bold"
            onClick={toggleMenu}
          >
            ≡
          </button>

          <img
            src={avatar}
            alt="avatar"
            className="w-12 h-12 rounded-full border-2 border-white"
          />

          <div>
            <h2 className="font-semibold text-sm">
              {user?.name || "Người dùng"} {/* Hiển thị name nếu có */}
            </h2>
            <p className="text-xs text-white">
              Đã chi: 0 đ - Số dư: {totalIncome} đ
            </p>
          </div>
        </div>

        <Bell size={22} className="text-white" />
      </div>

      {menuOpen && (
        <div className="absolute left-0 top-16 bg-gradient-to-r from-indigo-500 to-purple-500 text-white w-44 p-4 rounded-lg shadow-md transition-all ease-in-out z-10">
          <ul className="flex flex-col gap-3">
            <li className="py-2 px-2 hover:bg-white/10 rounded cursor-pointer">
              Home
            </li>
            <li className="py-2 px-2 hover:bg-white/10 rounded cursor-pointer">
              Thêm phòng mới
            </li>
            <li className="py-2 px-2 hover:bg-white/10 rounded cursor-pointer">
              QR Code
            </li>
            <li className="py-2 px-2 hover:bg-white/10 rounded cursor-pointer">
              Lịch sử chi tiêu
            </li>
            <li className="py-2 px-2 hover:bg-white/10 rounded cursor-pointer">
              Thống Kê
            </li>
            <li
              onClick={handleLogout}
              className="py-2 px-2 hover:bg-white/10 rounded cursor-pointer"
            >
              Đăng xuất
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DashboardNavbar;
