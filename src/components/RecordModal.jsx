import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import CategoryCard from "./CategoryCard";
import avatar from "../assets/avatar.jpg";
import axios from "axios";
import { useEffect } from "react";

const RecordModal = ({ onClose, onWithdrawSuccess }) => {
  const [selectAll, setSelectAll] = useState(true);
  const [selectedTab, setSelectedTab] = useState("user");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [amount, setAmount] = useState(""); // Thêm state số tiền
  const [description, setDescription] = useState(""); // Thêm state mô tả
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState(""); // Thêm state danh mục

  const users = [
    {
      name: "Đông Trần Khánh",
      email: "trankhanhdongk1@gmail.com",
      avatar,
    },
  ];

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/auth/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  const handleCategoryClick = (id) => {
    setCategory(id);
  };

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

  // Hàm xử lý rút tiền
  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ!");
      return;
    }
    // Lấy userId từ localStorage (hoặc props nếu có)
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;
    if (!userId) {
      alert("Không tìm thấy userId!");
      return;
    }

    const selectedCategory = categories.find((cat) => cat._id === category);
    const categoryName = selectedCategory ? selectedCategory.name : "";
    console.log("Dữ liệu gửi lên:", {
      user_id: userId,
      amount: Number(amount),
      category_id: category,
      source: categoryName, 
      note: description,
    });
    try {
      await axios.post("http://localhost:3000/api/auth/Withdraw", {
        user_id: userId,
        amount: Number(amount),
        category_id: category,
        source: categoryName, 
        note: description,
      });
      alert("Rút tiền thành công!");
      if (onWithdrawSuccess) onWithdrawSuccess();
      onClose();
    } catch (err) {
      alert("Rút tiền thất bại!");
    }
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
          <button
            className="text-purple-600 font-medium"
            onClick={handleWithdraw}
          >
            Lưu
          </button>
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
              {categories.map((cat) => (
                <CategoryCard
                  key={cat._id}
                  icon={cat.icon}
                  label={cat.name}
                  onClick={() => handleCategoryClick(cat._id)}
                  selected={category === cat._id}
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
            <div className="flex items-center gap-1">
              <input
                type="number"
                className="text-gray-700 outline-none text-right w-40 px-0 border-none bg-transparent"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Nhập số tiền"
                min={0}
                style={{ textAlign: "right" }}
              />
              <span className="text-gray-700">đ</span>
            </div>
          </div>

          <div className="flex justify-between items-center border-b py-2">
            <span className="text-gray-500">Ngày chi</span>
            <input
              type="date"
              className="text-gray-700 outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="border-b py-2">
            <textarea
              rows={2}
              className="w-full text-sm text-gray-700 outline-none"
              placeholder="Mô tả"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordModal;
