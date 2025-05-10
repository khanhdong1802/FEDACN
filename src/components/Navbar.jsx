import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import logo from "../assets/logo.png"; // Đường dẫn tới logo

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavigate = (id) => {
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
    if (location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/30 shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo + Tên app */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={handleHomeClick}
        >
          <img src={logo} alt="Logo" className="h-12 w-12 object-cover" />
          <span className="text-xl font-bold text-black">QuanLyChiTieu</span>
        </div>

        {/* Menu */}
        <ul className="flex space-x-6 text-sm font-medium text-gray-700">
          <li>
            <button
              onClick={handleHomeClick}
              className="hover:text-black transition"
            >
              Trang chủ
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigate("features")}
              className="hover:text-black transition"
            >
              Tính năng
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigate("guide")}
              className="hover:text-black transition"
            >
              Hướng dẫn
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigate("faq")}
              className="hover:text-black transition"
            >
              FAQ
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigate("download")}
              className="hover:text-black transition"
            >
              Download
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigate("contact")}
              className="hover:text-black transition"
            >
              Liên hệ
            </button>
          </li>
          <li>
            <Link to="/login" className="hover:text-black transition">
              Đăng nhập
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
