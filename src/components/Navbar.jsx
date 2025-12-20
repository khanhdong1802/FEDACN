import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavigate = (id) => {
    setOpen(false);
    if (location.pathname !== "/") {
      navigate("/", { replace: false });

      setTimeout(() => {
        scrollToSection(id);
      }, 100);
    } else {
      scrollToSection(id);
    }
  };

  const handleHomeClick = () => {
    setOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const menuItems = [
    { label: "Trang chủ", onClick: handleHomeClick },
    { label: "Tính năng", onClick: () => handleNavigate("features") },
    { label: "Hướng dẫn", onClick: () => handleNavigate("guide") },
    { label: "FAQ", onClick: () => handleNavigate("faq") },
    { label: "Download", onClick: () => handleNavigate("download") },
    { label: "Liên hệ", onClick: () => handleNavigate("contact") },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* nền blur + sáng hơn, bớt xám */}
      <div className="backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          {/* Logo + tên app */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={handleHomeClick}
          >
            {/* logo = riêng, không bọc thêm gradient box */}
            <img
              src={logo}
              alt="Logo"
              className="h-9 w-9 rounded-2xl shadow-md object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm sm:text-base font-semibold bg-gradient-to-r from-[#6C63FF] to-[#3F8CFF] bg-clip-text text-transparent">
                QuanLyChiTieu
              </span>
              <span className="hidden sm:block text-[11px] text-slate-500">
                Student expense tracker
              </span>
            </div>
          </div>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <ul className="flex items-center gap-5 text-slate-600">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={item.onClick}
                    className="transition-colors hover:text-[#6C63FF]"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>

            <Link
              to="/login"
              className="ml-4 inline-flex items-center justify-center px-4 h-9 rounded-full text-sm font-semibold text-white
                         bg-gradient-to-r from-[#6C63FF] to-[#3F8CFF]
                         shadow-[0_10px_25px_rgba(99,102,241,0.45)]
                         hover:shadow-[0_14px_32px_rgba(99,102,241,0.55)]
                         transition-all"
            >
              Đăng nhập
            </Link>
          </div>

          {/* Nút menu mobile */}
          <button
            className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-slate-200 text-slate-700 bg-white/90"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? (
              <FiX className="w-5 h-5" />
            ) : (
              <FiMenu className="w-5 h-5" />
            )}
          </button>
        </nav>
      </div>

      {/* Menu mobile dropdown */}
      {open && (
        <div className="md:hidden backdrop-blur-xl bg-white/95 border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 pb-3 pt-2">
            <ul className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={item.onClick}
                    className="w-full text-left py-1.5 hover:text-[#6C63FF] transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center w-full h-9 rounded-full text-sm font-semibold text-white
                             bg-gradient-to-r from-[#6C63FF] to-[#3F8CFF]
                             shadow-[0_10px_25px_rgba(99,102,241,0.45)]"
                >
                  Đăng nhập
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
