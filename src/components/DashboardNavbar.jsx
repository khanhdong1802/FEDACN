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
  const [months, setMonths] = useState(1);
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
          setMonths(data?.months || 1);
        })
        .catch((err) => console.error("Lỗi khi lấy hạn mức:", err));

      // Lấy danh sách phòng
      fetch(`http://localhost:3000/api/auth/groups?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setRooms(data.groups || []);
        })
        .catch((err) => console.error("Lỗi khi lấy danh sách phòng:", err));
    } catch (error) {
      console.error("Lỗi fetchNavbarData:", error);
    }
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

  // HÀM MỚI: Xử lý khi có giao dịch mới (cả thu nhập và chi tiêu cá nhân)
  const handleNewTransaction = (message, amountDelta, transactionType) => {
    console.log("NAVBAR: handleNewTransaction CALLED WITH:", {
      message,
      amountDelta,
      transactionType,
    }); // DEBUG

    const newNotificationObject = {
      id: Date.now(),
      message: message,
    };
    console.log(
      "NAVBAR: newNotificationObject created:",
      newNotificationObject
    ); // DEBUG

    setNotifications((prev) => {
      const updatedNotifications = [newNotificationObject, ...prev].slice(0, 5); // Giới hạn 5 thông báo
      console.log("NAVBAR: Notifications state updated:", updatedNotifications); // DEBUG
      return updatedNotifications;
    });

    // Logic cập nhật số dư và tổng chi (giữ nguyên như bạn đã có)
    if (transactionType !== "groupFundDirect") {
      setTotalIncome((prevTotalIncome) => prevTotalIncome + amountDelta);
      if (amountDelta < 0 && transactionType === "personal") {
        setTotalSpent((prevTotalSpent) => prevTotalSpent - amountDelta);
      }
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

      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 pb-6 rounded-b-3xl shadow-md relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar}>
              <Menu size={26} className="text-white" />
            </button>
            <img
              src={user?.avatar || avatar} // Sử dụng avatar từ user state nếu có
              alt="avatar"
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <div>
              <h2 className="font-semibold text-sm">
                {user?.name || "Người dùng"}
              </h2>
              <p className="text-xs text-white">
                Đã chi: {totalSpent.toLocaleString()} đ{" "}
                {/* HIỂN THỊ TOTALSPENT */}
                {spendingLimit > 0 && (
                  <>
                    {" "}
                    / {spendingLimit.toLocaleString()} đ / {months} tháng
                  </>
                )}{" "}
                - Số dư: {totalIncome.toLocaleString()} đ{" "}
                {/* TOTALINCOME GIỜ LÀ SỐ DƯ */}
              </p>
            </div>
          </div>

          {/* ... phần thông báo và sidebar giữ nguyên ... */}
          <div className="relative notification-bell-icon" ref={bellRef}>
            <Bell
              size={22}
              className="text-white cursor-pointer"
              onClick={() => setShowNotification((prev) => !prev)}
            />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
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

        {/* Sidebar trượt từ trái */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg z-[70] transform transition-transform duration-300 ${
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
            <li className="flex items-center gap-3 p-2 rounded hover:bg-white/20 cursor-pointer transition-colors duration-200">
              <History size={16} /> Lịch sử giao dịch
            </li>
            <li className="flex items-center gap-3 p-2 rounded hover:bg-white/20 cursor-pointer transition-colors duration-200">
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
      </div>
    </>
  );
};

export default DashboardNavbar;
