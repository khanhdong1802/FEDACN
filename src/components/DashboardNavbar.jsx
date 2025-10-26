import FloatingButton from "./FloatingButton";
import React, { useEffect, useRef, useState, useCallback } from "react"; // Thêm useCallback
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
  Settings,
  TrendingUp,
} from "lucide-react";
import avatar from "../assets/avatar.jpg";
import CreateRoomModal from "./CreateRoomModal";
import { useNavigate } from "react-router-dom";

const DashboardNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0); // Đây là số dư cá nhân
  const [totalSpent, setTotalSpent] = useState(0); // STATE MỚI: Tổng chi tiêu cá nhân
  const [spendingLimit, setSpendingLimit] = useState(0);
  // const [months, setMonths] = useState(1); // Removed unused state
  const [rooms, setRooms] = useState([]);
  const sidebarRef = useRef();
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const bellRef = useRef();
  const [notifications, setNotifications] = useState([]);

  // Hàm fetch dữ liệu ban đầu cho Navbar
  const fetchNavbarData = useCallback(async (userId) => {
    if (!userId) return;
    console.log("NAVBAR: Fetching navbar data for userId:", userId);
    try {
      // Lấy SỐ DƯ CÁ NHÂN (Tổng Thu - Tổng Chi)
      fetch(`http://localhost:3000/api/auth/balance/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.balance !== undefined) {
            setTotalIncome(data.balance);
          } else {
            console.error(
              "NAVBAR: API /balance không trả về data.balance",
              data
            );
            setTotalIncome(0);
          }
        })
        .catch((err) => {
          console.error("NAVBAR: Lỗi fetch balance:", err);
          setTotalIncome(0);
        });

      // Lấy TỔNG CHI TIÊU CÁ NHÂN
      fetch(`http://localhost:3000/api/auth/expenses/personal/total/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.total !== undefined) {
            setTotalSpent(data.total || 0);
          } else {
            console.error(
              "NAVBAR: API expenses/personal/total không trả về data.total",
              data
            );
            setTotalSpent(0);
          }
        })
        .catch((err) => {
          console.error("NAVBAR: Lỗi fetch tổng chi tiêu:", err);
          setTotalSpent(0);
        });

      // Lấy hạn mức chi tiêu
      fetch(`http://localhost:3000/api/auth/spending-limits/${userId}/current`)
        .then((res) => res.json())
        .then((data) => {
          setSpendingLimit(data?.amount || 0);
          // setMonths(data?.months || 1); // Removed unused setter
        })
        .catch((err) => console.error("Lỗi khi lấy hạn mức:", err));

      // Lấy danh sách phòng
      fetch(`http://localhost:3000/api/auth/groups?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setRooms(data.groups || []);
        })
        .catch((err) => console.error("Lỗi khi lấy danh sách phòng:", err));
    } catch (error) {}
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchNavbarData(parsedUser._id); // Gọi fetchNavbarData với userId
    }
  }, [fetchNavbarData]); // Thêm fetchNavbarData vào dependency array

  // Đóng sidebar và notification khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
      if (
        bellRef.current &&
        !bellRef.current.contains(e.target) &&
        !e.target.closest(".notification-bell-icon")
      ) {
        setShowNotification(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleNewTransaction = (message, amountDelta, transactionType) => {
    const newNotificationObject = {
      id: Date.now(),
      message: message,
    };
    setNotifications((prev) => {
      const updatedNotifications = [newNotificationObject, ...prev].slice(0, 5); // Giới hạn 5 thông báo
      console.log("NAVBAR: Notifications state updated:", updatedNotifications); // DEBUG
      return updatedNotifications;
    });
    if (user?._id) {
      fetchNavbarData(user._id); // Chỉ fetch lại số dư/tổng chi từ backend
    }
  };

  return (
    <>
      {showCreateRoomModal && (
        <CreateRoomModal
          isOpen={showCreateRoomModal}
          onClose={() => setShowCreateRoomModal(false)}
          // Thêm prop để có thể reload danh sách phòng sau khi tạo
          onRoomCreated={() => fetchNavbarData(user?._id)}
        />
      )}
      <FloatingButton
        onIncomeSuccess={(message, amountAdded) =>
          handleNewTransaction(message, amountAdded, "personalIncome")
        }
        onNewRecord={handleNewTransaction}
      />

      <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 pb-12 rounded-b-3xl shadow-md overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
            <button
              onClick={toggleSidebar}
              className="text-white hover:bg-white/20 transition-all rounded-full p-2"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative notification-bell-icon" ref={bellRef}>
              <button className="text-white hover:bg-white/20 transition-all rounded-full p-2 relative">
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
                )}
              </button>
              {showNotification && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-[60] p-4 max-h-96 overflow-y-auto">
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

          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 border-4 border-white/30 shadow-glow rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-400">
              <img
                src={user?.avatar || avatar}
                alt="avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="text-white flex-1">
              <h1 className="text-2xl font-bold mb-1 drop-shadow-md">
                {user?.name || "Người dùng"}
              </h1>
              <div className="flex items-center gap-2 text-white/90">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">
                  Tháng này:{" "}
                  {spendingLimit > 0
                    ? ((totalSpent / spendingLimit) * 100).toFixed(0)
                    : 0}
                  %
                </span>
                <span className="text-sm">
                  + Hạn mức:{" "}
                  {spendingLimit ? spendingLimit.toLocaleString() : "0"}đ +{" "}
                </span>
              </div>
            </div>
          </div>

          {/* Balance Cards đẹp như mẫu */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-4 backdrop-blur-md">
              <p className="text-white/80 text-xs mb-1">Đã chi</p>
              <p className="text-white text-xl font-bold">
                {totalSpent.toLocaleString()}đ
              </p>
            </div>
            <div className="glass rounded-2xl p-4 backdrop-blur-md">
              <p className="text-white/80 text-xs mb-1">Số dư</p>
              <p className="text-white text-xl font-bold">
                {totalIncome.toLocaleString()}đ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar trượt từ trái */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg z-[70] transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        ref={sidebarRef}
      >
        <div className="flex justify-between items-center px-4 py-4 border-b">
          <h2
            className="text-xl font-extrabold text-white flex items-center gap-2 tracking-wide uppercase"
            style={{ textShadow: "0 2px 8px #7c3aed, 0 0px 2px #fff" }}
          >
            <Menu size={22} className="text-white drop-shadow" />
            MENU
          </h2>
          <button onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>
        <ul className="flex flex-col p-4 text-sm gap-2 h-[calc(100%-57px)]">
          {" "}
          {/* 57px là chiều cao của header menu */}
          <li
            className="flex items-center gap-3 p-2 rounded hover:bg-white/20 cursor-pointer transition-colors duration-200"
            onClick={() => {
              setSidebarOpen(false);
              navigate("/dashboard");
            }}
          >
            <Home size={16} /> Trang chủ cá nhân
          </li>
          {rooms.map((room) => (
            <li
              key={room._id}
              className="flex items-center gap-3 p-2 rounded hover:bg-white/20 cursor-pointer transition-colors duration-200"
              onClick={() => {
                setSidebarOpen(false);
                navigate(`/dashboard/${room._id}`);
              }}
            >
              <Users size={16} />
              <span className="font-semibold">{room.name}</span>
            </li>
          ))}
          <li
            onClick={() => {
              setShowCreateRoomModal(true);
              setSidebarOpen(false);
            }}
            className="py-2 px-2 hover:bg-white/10 rounded cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} /> Thêm phòng mới
          </li>
          <li className="flex items-center gap-3 p-2 rounded hover:bg-white/20 cursor-pointer transition-colors duration-200">
            <QrCode size={16} /> QR Code
          </li>
          <li
            className="flex items-center gap-3 p-2 rounded hover:bg-white/20 cursor-pointer transition-colors duration-200"
            onClick={() => {
              setSidebarOpen(false);
              navigate("/transactions");
            }}
          >
            <History size={16} /> Lịch sử giao dịch
          </li>
          <li
            className="flex items-center gap-3 p-2 rounded hover:bg-white/20 cursor-pointer transition-colors duration-200"
            onClick={() => {
              setSidebarOpen(false);
              navigate("/stats");
            }}
          >
            <BarChart size={16} /> Thống kê
          </li>
          <li
            className="flex items-center gap-3 p-2 rounded hover:bg-white/20 cursor-pointer transition-colors duration-200"
            onClick={() => {
              setSidebarOpen(false);
              navigate("/dashboard/settings");
            }}
          >
            <Settings size={16} /> Cài đặt tài khoản
          </li>
          {/* Đẩy nút Đăng xuất xuống cuối */}
          <li
            onClick={handleLogout}
            className="flex items-center gap-3 p-2 rounded hover:bg-red-500/50 text-white cursor-pointer mt-auto"
          >
            <LogOut size={16} /> Đăng xuất
          </li>
        </ul>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[65] bg-black/20 backdrop-blur-sm"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default DashboardNavbar;
