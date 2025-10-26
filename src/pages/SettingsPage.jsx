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

  // Lấy thông tin user từ localStorage khi vào trang
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

    // Kiểm tra xác nhận mật khẩu nếu có nhập mật khẩu mới
    if (form.password && form.password !== form.confirmPassword) {
      setMessage("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) throw new Error("Không tìm thấy thông tin người dùng");
      const user = JSON.parse(storedUser);

      // Không gửi confirmPassword lên backend
      const { confirmPassword, ...submitForm } = form;

      const res = await fetch(
        `https://bedacn.onrender.com/api/admin/users/update/${user._id}`,
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

      // Cập nhật lại localStorage nếu thành công
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, name: form.name, email: form.email })
      );
      setMessage("Cập nhật thành công!");
      setForm({ ...form, password: "", confirmPassword: "" }); // Xóa mật khẩu sau khi lưu
    } catch (err) {
      setMessage(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Cập nhật tài khoản</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 font-medium">Tên</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded border"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded border"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Mật khẩu mới</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded border"
            placeholder="Để trống nếu không đổi"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            Xác nhận mật khẩu mới
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded border"
            placeholder="Nhập lại mật khẩu mới"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        {message && (
          <div className="mt-2 text-center text-sm text-green-600">
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default SettingsPage;
