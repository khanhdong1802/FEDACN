import { useState, useEffect } from "react";
import {
  Menu,
  Users,
  Tag,
  Users as GroupIcon,
  Receipt,
  Target,
  BarChart3,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Plus,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Thêm axios để gọi API

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]); // Lưu trữ dữ liệu người dùng từ API
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false); // Để theo dõi trạng thái loading
  const [editCategory, setEditCategory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    type: "",
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalTransactions: 0,
    userGrowthPercent: 0,
    newUsersThisMonth: 0,
    newUsersLastMonth: 0,
  });
  // Gọi API để lấy danh sách người dùng
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true); // Bắt đầu quá trình tải dữ liệu
      try {
        const response = await axios.get(
          "http://localhost:3000/api/admin/users"
        ); // Địa chỉ API của bạn
        setUsers(response.data); // Lưu dữ liệu vào state
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false); // Kết thúc quá trình tải dữ liệu
      }
    };

    fetchUsers();
  }, []); // Chỉ gọi API một lần khi component được mount

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLockUser = async (userId) => {
    try {
      await axios.patch(
        `http://localhost:3000/api/admin/users/${userId}/status/lock`
      );

      // Cập nhật lại trạng thái người dùng sau khi khóa
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, locked: true, status: "locked" }
            : user
        )
      );
    } catch (error) {
      console.error("Error locking user:", error);
    }
  };

  const handleUnlockUser = async (userId) => {
    try {
      await axios.patch(
        `http://localhost:3000/api/admin/users/${userId}/status/unlock`
      );

      // Cập nhật lại trạng thái người dùng sau khi mở khóa
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, locked: false, status: "active" }
            : user
        )
      );
    } catch (error) {
      console.error("Error unlocking user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Xác nhận trước khi xóa
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa người dùng này?"
    );
    if (!confirmDelete) return;

    try {
      // Gọi API để xóa người dùng
      await axios.delete(`http://localhost:3000/api/admin/users/${userId}`);

      // Cập nhật lại danh sách người dùng sau khi xóa
      setUsers((prevUsers) => prevUsers.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Không thể xóa người dùng này");
    }
  };

  // ================= CATEGORIES =================
  // Hàm gọi API lấy danh mục
  const handleFetchCategories = async () => {
    setLoading(true); // Bắt đầu  tải dữ liệu
    try {
      const res = await axios.get("http://localhost:3000/api/admin/categories"); // Địa chỉ API của bạn
      setCategories(res.data); // Lưu dữ liệu vào state categories
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    } finally {
      setLoading(false); // Kết thúc  tải dữ liệu
    }
  };

  // Handle Add New Category
  const handleAddCategory = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/admin/categories",
        newCategory
      );
      const addedCategory = response.data;

      // Update the state with the new category
      setCategories((prevCategories) => [...prevCategories, addedCategory]);
      setShowAddModal(false); // Close the modal
      setNewCategory({ name: "", description: "", type: "" }); // Reset form fields
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Không thể thêm danh mục");
    }
  };
  // Gọi API lấy danh mục khi component được mount
  useEffect(() => {
    handleFetchCategories();
  }, []); // [] là chỉ gọi một lần khi component được mount

  // Hàm lọc danh mục theo tên hoặc loại
  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Xóa danh mục
  const handleDeleteCategory = async (categoryId) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa danh mục này?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:3000/api/admin/categories/${categoryId}`
      );
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category._id !== categoryId)
      );
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Không thể xóa danh mục này");
    }
  };

  // Sửa danh mục
  const handleEditCategory = async (category) => {
    setEditCategory(category); // Chuyển sang chế độ chỉnh sửa
  };

  const handleSaveCategory = async () => {
    const { _id, name, description, icon } = editCategory;
    try {
      const response = await axios.put(
        `http://localhost:3000/api/admin/categories/${_id}`,
        { name, description, icon }
      );
      const updatedCategory = response.data;

      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat._id === updatedCategory._id ? updatedCategory : cat
        )
      );
      setEditCategory(null); // Thoát chế độ chỉnh sửa
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Không thể sửa danh mục này");
    }
  };
  // ================= GROUPS =================
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true); // Bắt đầu quá trình tải dữ liệu
      try {
        const response = await axios.get(
          "http://localhost:3000/api/admin/users"
        ); // Địa chỉ API của bạn
        setUsers(response.data); // Lưu dữ liệu vào state
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false); // Kết thúc quá trình tải dữ liệu
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:3000/api/group/groups/all"
        ); // Gọi API lấy nhóm
        setGroups(response.data.groups); // Cập nhật dữ liệu nhóm vào state
      } catch (err) {
        console.error("Error fetching groups:", err);
      } finally {
        setLoading(false); // Kết thúc quá trình tải dữ liệu
      }
    };
    fetchGroups();
  }, []);

  const handleDeleteGroup = async (groupId) => {
    console.log("groupId trước khi gọi API xóa:", groupId); // Log groupId trước khi gửi API

    if (!groupId || typeof groupId !== "string" || groupId.length !== 24) {
      alert("Nhóm không hợp lệ!");
      return;
    }

    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa nhóm này?");
    if (!confirmDelete) return;

    try {
      // Gọi API để xóa nhóm
      const response = await axios.delete(
        `http://localhost:3000/api/group/groups/${groupId}`
      );

      // Kiểm tra phản hồi từ API trước khi cập nhật lại state
      if (response.status === 200) {
        setGroups((prevGroups) =>
          prevGroups.filter((group) => group._id !== groupId)
        );
        alert("Nhóm đã bị xóa thành công");
      } else {
        alert("Không thể xóa nhóm");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API xóa nhóm:", error);
      alert("Không thể xóa nhóm này");
    }
  };
  // ========================================
  // Gọi API để lấy thông tin thống kê
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/admin/stats/overview"
        );
        setStats(response.data); // Cập nhật state với dữ liệu trả về từ API
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats(); // Gọi API khi component được mount
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#7C3AED] via-[#9F5BFF] to-[#7C3AED]">
      {/* HEADER */}
      <div className="px-6 pt-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button className="p-2 text-white hover:bg-white/10 rounded-lg">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <button
            className="p-2 text-white hover:bg-white/10 rounded-lg"
            onClick={() => navigate("/dashboard")}
          >
            <BarChart3 className="h-6 w-6" />
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 text-white">
            <p className="text-sm opacity-80">Tổng người dùng</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 text-white">
            <p className="text-sm opacity-80">Tổng nhóm</p>
            <p className="text-2xl font-bold">{stats.totalGroups}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 text-white">
            <p className="text-sm opacity-80">Giao dịch</p>
            <p className="text-2xl font-bold">{stats.totalTransactions}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 text-white">
            <p className="text-sm opacity-80">Tăng trưởng</p>
            <p className="text-2xl font-bold">+{stats.userGrowthPercent}%</p>
          </div>
        </div>
      </div>

      {/* CONTENT WRAPPER */}
      <div className="px-6">
        <div className="bg-white rounded-t-3xl p-6 min-h-[70vh] shadow-xl">
          {/* TABS */}
          <div className="flex gap-2 overflow-auto mb-6 border rounded-full p-1 bg-gray-100">
            {[
              ["users", <Users className="h-4 w-4" />, "Người dùng"],
              ["categories", <Tag className="h-4 w-4" />, "Danh mục"],
              ["groups", <GroupIcon className="h-4 w-4" />, "Nhóm"],
              ["transactions", <Receipt className="h-4 w-4" />, "Giao dịch"],
              ["limits", <Target className="h-4 w-4" />, "Hạn mức"],
              ["dashboard", <BarChart3 className="h-4 w-4" />, "Dashboard"],
            ].map(([key, icon, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition 
                  ${
                    activeTab === key
                      ? "bg-white shadow font-semibold"
                      : "text-gray-500"
                  }`}
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* ================= USERS ================= */}
          {activeTab === "users" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className="pl-10 border rounded-lg w-full py-2"
                    placeholder="Tìm kiếm người dùng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Thêm người dùng
                </button>
              </div>

              <div className="border rounded-xl p-4 shadow-sm">
                <p className="text-xl font-semibold mb-3">
                  Danh sách người dùng
                </p>

                {/* Hiển thị loading khi đang tải dữ liệu */}
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2">Tên</th>
                        <th>Email</th>
                        <th>Ngày tạo</th>
                        <th>Trạng thái</th>
                        <th className="text-right">Hành động</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="border-b">
                          <td className="py-2">{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            {new Date(u.registered_at).toLocaleDateString()}
                          </td>
                          <td>
                            {u.locked ? (
                              <span className="px-3 py-1 text-sm text-white bg-red-500 rounded-full">
                                Bị khóa
                              </span>
                            ) : (
                              <span className="px-3 py-1 text-sm text-white bg-green-500 rounded-full">
                                Hoạt động
                              </span>
                            )}
                          </td>
                          <td className="text-right space-x-2">
                            {u.status === "active" ? (
                              <button
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                onClick={() => handleLockUser(u._id)} // Khóa tài khoản
                              >
                                <Lock className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                onClick={() => handleUnlockUser(u._id)} // Mở khóa tài khoản
                              >
                                <Unlock className="h-4 w-4" />
                              </button>
                            )}
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 hover:bg-gray-100 rounded-lg"
                              onClick={() => handleDeleteUser(u._id)} // Xóa người dùng
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ================= CATEGORIES ================= */}
          {activeTab === "categories" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Quản lý danh mục</h2>

                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  onClick={() => setShowAddModal(true)} // Mở modal thêm danh mục
                >
                  <Plus className="h-4 w-4" /> Thêm danh mục
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Loading */}
                {loading ? (
                  <div>Đang tải...</div>
                ) : (
                  filteredCategories.map((c) => (
                    <div
                      key={c._id}
                      className="p-5 border rounded-xl shadow flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                          {c.icon}
                        </div>

                        <div>
                          <p className="text-lg font-semibold">{c.name}</p>
                          <p className="text-gray-500 text-sm">
                            {c.type === "expense" ? "Chi tiêu" : "Thu nhập"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          className="px-3 py-1 border rounded-lg flex items-center gap-1"
                          onClick={() => handleEditCategory(c)}
                        >
                          <Edit className="h-3 w-3" /> Sửa
                        </button>

                        <button
                          className="px-3 py-1 border rounded-lg flex items-center gap-1"
                          onClick={() => handleDeleteCategory(c._id)}
                        >
                          <Trash2 className="h-3 w-3" /> Xóa
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Edit Modal */}
              {editCategory && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-700 bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg w-96">
                    <h3 className="text-xl font-semibold mb-4">Sửa danh mục</h3>

                    <div>
                      <label className="block mb-1">Tên danh mục</label>
                      <input
                        type="text"
                        className="border p-2 w-full"
                        value={editCategory.name}
                        onChange={(e) =>
                          setEditCategory({
                            ...editCategory,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block mb-1">Mô tả</label>
                      <textarea
                        className="border p-2 w-full"
                        value={editCategory.description}
                        onChange={(e) =>
                          setEditCategory({
                            ...editCategory,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mt-4 flex justify-between">
                      <button
                        onClick={handleSaveCategory}
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditCategory(null)}
                        className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Category Modal */}
              {showAddModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-700 bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg w-96">
                    <h3 className="text-xl font-semibold mb-4">
                      Thêm danh mục mới
                    </h3>

                    <div>
                      <label className="block mb-1">Tên danh mục</label>
                      <input
                        type="text"
                        className="border p-2 w-full"
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block mb-1">Mô tả</label>
                      <textarea
                        className="border p-2 w-full"
                        value={newCategory.description}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mt-4 flex justify-between">
                      <button
                        onClick={handleAddCategory}
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setShowAddModal(false)}
                        className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= GROUPS ================= */}
          {activeTab === "groups" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Quản lý nhóm & quỹ</h2>

              <div className="grid md:grid-cols-2 gap-4">
                {groups.map((g) => (
                  <div key={g.id} className="p-5 border rounded-xl shadow">
                    <p className="text-lg font-semibold">{g.name}</p>
                    <p className="text-gray-500 text-sm">Chủ nhóm: {g.owner}</p>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Thành viên:</span>
                        <span className="font-semibold">{g.members} người</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Số dư:</span>
                        <span className="font-semibold text-purple-600">
                          {g.balance.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        className="flex-1 py-1 border rounded-lg flex items-center justify-center gap-1"
                        onClick={() => {
                          console.log("groupId khi xóa nhóm:", g.id); // Log nhóm khi xóa
                          handleDeleteGroup(g.id); // Truyền đúng groupId vào đây
                        }}
                      >
                        <Trash2 className="h-3 w-3" /> Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TRANSACTIONS ================= */}
          {activeTab === "transactions" && (
            <div className="border rounded-xl p-6 shadow">
              <h2 className="text-xl font-semibold">Giám sát giao dịch</h2>
              <p className="text-gray-500 text-sm mt-1">
                Tính năng đang được phát triển...
              </p>
            </div>
          )}

          {/* ================= LIMITS ================= */}
          {activeTab === "limits" && (
            <div className="border rounded-xl p-6 shadow">
              <h2 className="text-xl font-semibold">Quản lý hạn mức</h2>
              <p className="text-gray-500 text-sm mt-1">
                Tính năng đang được phát triển...
              </p>
            </div>
          )}

          {/* ================= DASHBOARD ================= */}
          {activeTab === "dashboard" && (
            <div className="border rounded-xl p-6 shadow">
              <h2 className="text-xl font-semibold">Dashboard tổng quan</h2>
              <p className="text-gray-500 text-sm mt-1">
                Tính năng đang được phát triển...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
