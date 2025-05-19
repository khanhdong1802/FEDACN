import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import CategoryCard from "./CategoryCard";
import avatar from "../assets/avatar.jpg";

const RecordModal = ({ onClose }) => {
  const [selectAll, setSelectAll] = useState(true);
  const [selectedTab, setSelectedTab] = useState("user"); // "user" or "category"
  const [selectedUsers, setSelectedUsers] = useState([]);

  const users = [
    {
      name: "Đông Trần Khánh",
      email: "trankhanhdongk1@gmail.com",
      avatar,
    },
  ];

  const categories = [
    { icon: "🏠", label: "Tiền nhà" },
    { icon: "🍱", label: "Thức ăn" },
    { icon: "🎓", label: "Học phí" },
    { icon: "🚌", label: "Đi lại" },
    { icon: "📱", label: "Đồ dùng" },
    { icon: "💤", label: "Tiền ngủ" },
  ];

  const handleCategoryClick = (label) => {
    alert(`Chọn danh mục: ${label}`);
  };

  // Cập nhật chọn tất cả
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((_, idx) => idx));
    }
    setSelectAll(!selectAll);
  };

  const toggleUserSelect = (index) => {
    const isSelected = selectedUsers.includes(index);
    const newSelected = isSelected
      ? selectedUsers.filter((i) => i !== index)
      : [...selectedUsers, index];
    setSelectedUsers(newSelected);
    setSelectAll(newSelected.length === users.length);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-2">
          <button onClick={onClose}>
            <X size={24} />
          </button>
          <h1 className="text-lg font-medium">Ghi chép</h1>
          <button className="text-purple-600 font-medium">Lưu</button>
        </div>

        {/* Tab buttons */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              selectedTab === "user"
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => setSelectedTab("user")}
          >
            Người sử dụng
          </button>
          <button
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              selectedTab === "category"
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => setSelectedTab("category")}
          >
            Danh mục
          </button>
        </div>

        {/* Content tabs */}
        {selectedTab === "user" ? (
          <div className="mb-4">
            <h2 className="font-semibold text-sm text-gray-600 mb-2">
              Người sử dụng
            </h2>

            {/* Danh sách user có checkbox */}
            <div className="flex flex-col gap-3">
              {users.map((user, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="accent-purple-500"
                    checked={selectedUsers.includes(idx)}
                    onChange={() => toggleUserSelect(idx)}
                  />
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chọn tất cả */}
            <div className="flex items-center justify-between mt-4">
              <span>Chọn tất cả</span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-purple-500 relative transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow absolute left-0 peer-checked:translate-x-full transition"></div>
                </div>
              </label>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <h2 className="font-semibold text-sm text-gray-600 mb-2">
              Danh mục
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((cat, idx) => (
                <CategoryCard
                  key={idx}
                  icon={cat.icon}
                  label={cat.label}
                  onClick={() => handleCategoryClick(cat.label)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Các trường ghi chép */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center border-b py-2">
            <span className="text-gray-500">Phương Thức</span>
            <button className="flex items-center gap-1 text-sm text-gray-700">
              Sử dụng tiền quỹ phòng <ChevronDown size={16} />
            </button>
          </div>

          <div className="flex justify-between items-center border-b py-2">
            <span className="text-gray-500">Số tiền</span>
            <span className="text-gray-700">0 đ</span>
          </div>

          <div className="flex justify-between items-center border-b py-2">
            <span className="text-gray-500">Ngày chi</span>
            <input
              type="date"
              className="text-gray-700 outline-none"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="border-b py-2">
            <textarea
              rows={2}
              className="w-full text-sm text-gray-700 outline-none"
              placeholder="Mô tả"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordModal;
