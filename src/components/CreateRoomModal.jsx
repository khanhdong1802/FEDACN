import React, { useState, useEffect } from "react";

export default function CreateRoomModal({ isOpen, onClose }) {
  const [roomName, setRoomName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Gợi ý email
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!memberEmail.trim()) {
        setEmailSuggestions([]);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:3000/api/auth/search?q=${memberEmail}`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setEmailSuggestions(data);
        }
      } catch (err) {
        console.error("Lỗi khi tìm kiếm email:", err);
      }
    };

    fetchSuggestions();
  }, [memberEmail]);

  if (!isOpen) return null;

  const toggleMemberSelection = (userId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
          members: selectedMemberIds,
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
              Tìm email thành viên
            </label>
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none"
              placeholder="Nhập email..."
            />
          </div>
          {/* Gợi ý thành viên */}
          {emailSuggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">Gợi ý</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {emailSuggestions.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => {
                      setMemberEmail(user.email);
                      if (!selectedMemberIds.includes(user._id)) {
                        toggleMemberSelection(user._id);
                      }
                      setEmailSuggestions([]); // ẩn gợi ý sau khi chọn
                    }}
                    className="w-full flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md hover:bg-gray-200 transition"
                  >
                    <div className="flex items-center gap-3 text-left">
                      {/* Avatar chữ cái đầu */}
                      <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">
                          {user.name || "Không tên"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.includes(user._id)}
                        readOnly
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

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
