import React, { useEffect, useState } from "react";

const SettingsPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load user info from localStorage when the page loads
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Check password confirmation if new password is entered
    if (form.password && form.password !== form.confirmPassword) {
      setMessage("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) throw new Error("Không tìm thấy thông tin người dùng");
      const user = JSON.parse(storedUser);

      // Do not send confirmPassword to backend
      const { confirmPassword, ...submitForm } = form;

      const res = await fetch(
        `http://localhost:3000/api/admin/users/update/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitForm),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

      // Update localStorage on success
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, name: form.name, email: form.email })
      );
      setMessage("Cập nhật thành công!");
      setForm({ ...form, password: "", confirmPassword: "" }); // Clear password fields after saving
    } catch (err) {
      setMessage(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center py-10 px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Cập nhật tài khoản
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Để trống nếu không đổi"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>

          {/* Success or Error Message */}
          {message && (
            <div className="mt-3 text-center text-sm text-red-600">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
