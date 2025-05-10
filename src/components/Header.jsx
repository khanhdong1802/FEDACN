import React from "react";

const Header = () => {
  return (
    <header
      id="home"
      className="h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white"
    >
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">Quản Lý Chi Tiêu</h1>
        <p className="text-xl">
          Ứng dụng quản lý chi tiêu tốt nhất cho sinh viên.
        </p>
      </div>
    </header>
  );
};

export default Header;
