import React, { useState } from "react";

export default function CreateRoomModal({ isOpen, onClose }) {
  const [roomName, setRoomName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) throw new Error("Không tìm thấy người dùng");

      const user = JSON.parse(storedUser);

      const response = await fetch("http://localhost:3000/api/auth/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: roomName,
          description: "",
          created_by: user._id,
          members: [], // hoặc thêm userId từ email nếu bạn lookup
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Tạo nhóm thất bại:", data);
        alert("❌ Tạo nhóm thất bại: " + data.message);
      } else {
        alert("✅ Nhóm đã được tạo thành công!");
        onClose();
      }
    } catch (error) {
      console.error("❌ Lỗi:", error);
      alert("❌ Đã có lỗi xảy ra khi gửi yêu cầu.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
        <button
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold text-center mb-4">
          Tạo phòng mới
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhập tên phòng
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-indigo-500"
              placeholder="Tên phòng"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thành viên
            </label>
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none"
              placeholder="Email..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md transition"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </form>
      </div>
    </div>
  );
}
