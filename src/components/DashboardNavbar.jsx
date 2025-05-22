import FloatingButton from "./FloatingButton";
import React, { useEffect, useRef, useState } from "react";
import {
  Users,
  Bell,
  Home,
  LogOut,
  Plus,
  BarChart,
  QrCode,
  History,
  Menu,
  X,
  Settings, // Thêm dòng này
} from "lucide-react";
import avatar from "../assets/avatar.jpg";
import CreateRoomModal from "./CreateRoomModal";
import { useNavigate } from "react-router-dom";
const DashboardNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [spendingLimit, setSpendingLimit] = useState(0);
  const [months, setMonths] = useState(1);
  const [rooms, setRooms] = useState([]);
  const sidebarRef = useRef();
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const bellRef = useRef();
  const [notifications, setNotifications] = useState([]);
  // Đóng sidebar khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lấy thông tin người dùng và tổng thu nhập
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      fetch(`http://localhost:3000/api/auth/Income/total/${parsedUser._id}`)
        .then((res) => res.json())
        .then((data) => setTotalIncome(data.total || 0))
        .catch((err) => console.error("Lỗi khi lấy tổng thu nhập:", err));

      // Đổi endpoint lấy hạn mức active
      fetch(
        `http://localhost:3000/api/auth/spending-limits/${parsedUser._id}/current`
      )
        .then((res) => res.json())
        .then((data) => {
          setSpendingLimit(data?.amount || 0);
          setMonths(data?.months || 1); // Lưu số tháng từ CSDL
        })
        .catch((err) => console.error("Lỗi khi lấy hạn mức:", err));

      // Lấy danh sách phòng
      fetch(`http://localhost:3000/api/auth/groups?userId=${parsedUser._id}`)
        .then((res) => res.json())
        .then((data) => {
          setRooms(data.groups || []);
        })
        .catch((err) => console.error("Lỗi khi lấy danh sách phòng:", err));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      {showCreateRoomModal && (
        <CreateRoomModal
          isOpen={showCreateRoomModal}
          onClose={() => setShowCreateRoomModal(false)}
        />
      )}
      <FloatingButton
        onIncomeSuccess={(msg, newTotalIncome) => {
          console.log("Thông báo mới:", msg);
          setNotifications((prev) => [
            { id: Date.now(), message: msg },
            ...prev,
          ]);
          setTotalIncome(newTotalIncome);
          setUser((prev) => ({
            ...prev,
            totalIncome: newTotalIncome,
          }));
        }}
      />

      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 pb-6 rounded-b-3xl shadow-md relative">
        <div className="flex justify-between items-center">
          {/* Nút menu + avatar */}
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar}>
              <Menu size={26} className="text-white" />
            </button>
            <img
              src={avatar}
              alt="avatar"
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <div>
              <h2 className="font-semibold text-sm">
                {user?.name || "Người dùng"}
              </h2>
              <p className="text-xs text-white">
                Đã chi: 0 đ
                {spendingLimit > 0 && (
                  <>
                    {" "}
                    /{spendingLimit.toLocaleString()} đ /{months} tháng
                  </>
                )}{" "}
                - Số dư: {totalIncome.toLocaleString()} đ
              </p>
            </div>
          </div>

          <div className="relative" ref={bellRef}>
            <Bell
              size={22}
              className="text-white cursor-pointer"
              onClick={() => setShowNotification((prev) => !prev)}
            />
            {showNotification && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 p-4">
                <div className="flex flex-col gap-2">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center py-8">
                      <Bell size={40} className="text-gray-400 mb-2" />
                      <p className="text-gray-700 font-semibold mb-1">
                        Thông báo của bạn hiển thị ở đây
                      </p>
                      <p className="text-gray-500 text-sm text-center">
                        Hiện chưa có thông báo nào.
                      </p>
                    </div>
                  ) : (
                    notifications.map((noti) => (
                      <div
                        key={noti.id}
                        className="p-2 border-b last:border-b-0"
                      >
                        <span className="text-gray-800 text-sm">
                          {noti.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar trượt từ trái */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg z-50 transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          ref={sidebarRef}
        >
          <div className="flex justify-between items-center px-4 py-4 border-b">
            <h2 className="text-lg font-bold">Menu</h2>
            <button onClick={toggleSidebar}>
              <X size={20} />
            </button>
          </div>
          <ul className="flex flex-col p-4 text-sm gap-2">
            <li
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors duration-200"
              onClick={() => {
                setSidebarOpen(false);
                navigate("/dashboard");
              }}
            >
              <Home size={16} /> Trang chủ
            </li>

            {/* Danh sách phòng */}
            {rooms.map((room) => (
              <li
                key={room._id}
                className="flex items-center gap-3 p-2 rounded hover:bg-purple-100 cursor-pointer transition-colors duration-200"
                onClick={() => {
                  setSidebarOpen(false);
                  navigate(`/dashboard/${room._id}`);
                }}
              >
                <Users size={16} className="text-white" />
                <span className="font-semibold">{room.name}</span>
              </li>
            ))}

            <li
              onClick={() => setShowCreateRoomModal(true)}
              className="py-2 px-2 hover:bg-white/10 rounded cursor-pointer flex items-center gap-2"
            >
              <Plus size={16} /> Thêm phòng mới
            </li>

            <li className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors duration-200">
              <QrCode size={16} /> QR Code
            </li>
            <li className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors duration-200">
              <History size={16} /> Lịch sử chi tiêu
            </li>
            <li className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors duration-200">
              <BarChart size={16} /> Thống kê
            </li>
            
            {/* Thêm mục Cài đặt ở đây */}
            <li
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors duration-200"
              onClick={() => {
                setSidebarOpen(false);
                navigate("/dashboard/settings");
              }}
            >
              <Settings size={16} /> Cài đặt
            </li>

            <li
              onClick={handleLogout}
              className="flex items-center gap-3 p-2 rounded hover:bg-red-100 text-red-600 cursor-pointer"
            >
              <LogOut size={16} /> Đăng xuất
            </li>
          </ul>
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={toggleSidebar}
          ></div>
        )}
      </div>
    </>
  );
};

export default DashboardNavbar;
