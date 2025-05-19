import React, { useState } from "react";

export default function CreateRoomModal({ isOpen, onClose }) {
  const [roomName, setRoomName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Tạo phòng:", roomName, memberEmail);
    onClose();
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

          {/* Gợi ý giả */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Gợi ý</p>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Quỳnh Bùi Như</p>
                  <p className="text-xs text-gray-500">
                    nhuquynh130895@gmail.com
                  </p>
                </div>
              </div>
              <input type="checkbox" className="form-checkbox" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md transition"
          >
            Lưu
          </button>
        </form>
      </div>
    </div>
  );
}
