import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Crown, UserPlus } from "lucide-react";

function formatCurrency(value) {
  if (!value) return "0 đ";
  return `${Number(value).toLocaleString("vi-VN")} đ`;
}

export default function GroupMembersPage() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();

  const [groupInfo, setGroupInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("members");

  const [inviteEmail, setInviteEmail] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState([]);

  const menuRef = useRef(null);

  // Lấy dữ liệu nhóm + thành viên
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Thông tin nhóm
        const resGroup = await fetch(
          `http://localhost:3000/api/group/${groupId}`
        );
        const group = await resGroup.json();

        // Số dư + tổng chi nhóm
        const resActualBalance = await fetch(
          `http://localhost:3000/api/group/groups/${groupId}/actual-balance`
        );
        const actualBalanceData = await resActualBalance.json();

        setGroupInfo({
          ...group,
          balance: actualBalanceData.balance,
          totalSpent: actualBalanceData.totalSpent,
        });

        // Danh sách thành viên + chi tiêu
        const resMembers = await fetch(
          `http://localhost:3000/api/group/groups/${groupId}/member-expenses`
        );
        const data = await resMembers.json();
        setMembers(data.members || []);
      } catch (e) {
        console.error("Lỗi load dữ liệu nhóm:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [groupId]);

  // Gộp + sort theo tổng chi
  const membersWithSpent = members.map((mem) => ({
    ...mem,
    totalSpent: mem.totalSpent || 0,
  }));
  const sortedMembers = [...membersWithSpent].sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;
  const isLeader = groupInfo?.created_by === currentUserId;

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reload member list sau khi thêm / xóa
  const reloadMembers = async () => {
    const resMembers = await fetch(
      `http://localhost:3000/api/group/groups/${groupId}/member-expenses`
    );
    const data = await resMembers.json();
    setMembers(data.members || []);
  };
  const handleDeleteGroup = async () => {
    if (!groupId) {
      alert("Không xác định được nhóm để xóa");
      return;
    }

    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa nhóm "${groupInfo?.name || ""}" không?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/group/groups/${groupId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message || "Không thể xóa nhóm");
        return;
      }

      alert("Nhóm đã bị xóa thành công");
      navigate(-1); // hoặc navigate("/dashboard") tùy bạn muốn quay về đâu
    } catch (err) {
      console.error("Lỗi khi xóa nhóm:", err);
      alert("Lỗi máy chủ khi xóa nhóm");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER GRADIENT */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 relative overflow-hidden pb-8">
        {/* Vòng tròn trang trí */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-5 right-5 w-24 h-24 bg-white/10 rounded-full blur-xl" />

        {/* Top bar */}
        <div className="flex items-center justify-between p-4 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full text-white hover:bg-white/20 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="text-lg font-semibold text-white truncate max-w-[55%] text-center">
            {groupInfo?.name || "Nhóm"}
          </h1>

          {isLeader ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="p-2 rounded-full text-white hover:bg-white/20 transition"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg text-sm text-gray-700 overflow-hidden z-20">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setShowMenu(false);
                      handleDeleteGroup();
                    }}
                  >
                    Xóa nhóm
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-9" />
          )}
        </div>

        {/* Member avatars + Balance + Nút thêm */}
        <div className="flex flex-col items-center relative z-10">
          {/* Avatars */}
          <div className="flex items-center justify-center gap-3 mb-3 flex-wrap">
            {sortedMembers.slice(0, 5).map((mem) => (
              <div key={mem.user_id} className="flex flex-col items-center">
                <div
                  className={`h-14 w-14 rounded-full border-2 flex items-center justify-center bg-white text-indigo-700 font-semibold text-lg ${
                    groupInfo?.created_by === mem.user_id
                      ? "border-yellow-400 ring-2 ring-yellow-400/50"
                      : "border-white/60"
                  }`}
                >
                  {mem.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <span className="text-xs text-white mt-1 max-w-[70px] truncate text-center">
                  {mem.name}
                </span>
                {groupInfo?.created_by === mem.user_id && (
                  <Crown className="h-3 w-3 text-yellow-300 mt-0.5" />
                )}
              </div>
            ))}
          </div>

          {/* Số dư nhóm */}
          <p className="text-white/90 text-sm">
            Số dư nhóm:{" "}
            <span className="font-semibold text-white">
              {loading ? "Đang tải..." : formatCurrency(groupInfo?.balance)}
            </span>
          </p>

          {isLeader && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/70 text-white text-sm bg-white/10 hover:bg-white/20 transition"
            >
              <UserPlus className="h-4 w-4" />
              Thêm thành viên
            </button>
          )}
        </div>
      </div>

      {/* CONTENT trắng bên dưới */}
      <div className="-mt-4 bg-white rounded-t-3xl relative z-20 min-h-[60vh] shadow-lg">
        <div className="p-6">
          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-gray-100 rounded-full p-1">
              <button
                className={`px-4 py-1.5 text-sm rounded-full transition ${
                  activeTab === "members"
                    ? "bg-white shadow font-semibold text-gray-900"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("members")}
              >
                Thành viên
              </button>
              <button
                className={`px-4 py-1.5 text-sm rounded-full transition ${
                  activeTab === "categories"
                    ? "bg-white shadow font-semibold text-gray-900"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("categories")}
              >
                Danh mục
              </button>
            </div>
          </div>

          {/* TAB: Thành viên */}
          {activeTab === "members" && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Danh sách thành viên
              </h2>

              {loading ? (
                <div className="text-center text-gray-500 py-6">
                  Đang tải dữ liệu...
                </div>
              ) : sortedMembers.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  Nhóm chưa có thành viên.
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedMembers.map((mem) => (
                    <div
                      key={mem.user_id}
                      className="rounded-2xl p-4 flex items-center justify-between bg-white shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-700 font-semibold ${
                            groupInfo?.created_by === mem.user_id
                              ? "ring-2 ring-yellow-400"
                              : ""
                          }`}
                        >
                          {mem.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {mem.name}
                            </span>
                            {groupInfo?.created_by === mem.user_id && (
                              <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                                Trưởng phòng
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {mem.email}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Đã chi: {formatCurrency(mem.totalSpent)}
                        </p>
                        {isLeader && mem.user_id !== groupInfo?.created_by && (
                          <button
                            className="text-xs text-red-500 hover:underline mt-1"
                            onClick={async () => {
                              if (
                                window.confirm(
                                  "Bạn chắc chắn muốn xóa thành viên này?"
                                )
                              ) {
                                await fetch(
                                  `http://localhost:3000/api/group/groups/${groupId}/members/${mem.user_id}`,
                                  { method: "DELETE" }
                                );
                                await reloadMembers();
                              }
                            }}
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB: Danh mục (placeholder) */}
          {activeTab === "categories" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Danh mục nhóm
              </h2>
              <p className="text-gray-500 text-sm">
                Tính năng danh mục cho từng nhóm đang được phát triển…
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL THÊM THÀNH VIÊN */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 relative animate-fadeIn">
            <h3 className="font-bold text-lg mb-4 text-indigo-700 flex items-center gap-2">
              <span className="inline-flex bg-indigo-100 text-indigo-700 rounded-full p-2">
                <UserPlus className="h-4 w-4" />
              </span>
              Thêm thành viên
            </h3>

            <div className="relative">
              <input
                type="email"
                className="border border-indigo-200 focus:border-indigo-500 outline-none px-3 py-2 rounded w-full mb-2 text-gray-800"
                placeholder="Nhập email thành viên"
                value={inviteEmail}
                onChange={async (e) => {
                  const value = e.target.value;
                  setInviteEmail(value);

                  if (value.trim()) {
                    const res = await fetch(
                      `http://localhost:3000/api/group/search?q=${value}`
                    );
                    const data = await res.json();
                    setEmailSuggestions(Array.isArray(data) ? data : []);
                  } else {
                    setEmailSuggestions([]);
                  }
                }}
                autoFocus
              />

              {/* Gợi ý email */}
              {emailSuggestions && emailSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-xl shadow max-h-40 overflow-y-auto z-40">
                  {emailSuggestions.map((user) => (
                    <button
                      key={user._id}
                      type="button"
                      className="flex items-center w-full px-3 py-2 hover:bg-indigo-50 text-left"
                      onClick={() => {
                        setInviteEmail(user.email);
                        setEmailSuggestions([]);
                      }}
                    >
                      <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                        {user.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {user.name || "Không tên"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                onClick={() => {
                  setShowAddModal(false);
                  setInviteEmail("");
                  setEmailSuggestions([]);
                }}
              >
                Hủy
              </button>
              <button
                className="px-4 py-1.5 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 text-sm disabled:opacity-60"
                disabled={!inviteEmail}
                onClick={async () => {
                  const res = await fetch(
                    `http://localhost:3000/api/group/groups/${groupId}/members`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: inviteEmail }),
                    }
                  );
                  if (res.ok) {
                    setInviteEmail("");
                    setShowAddModal(false);
                    setEmailSuggestions([]);
                    await reloadMembers();
                  } else {
                    alert(
                      "Không thể thêm thành viên. Vui lòng kiểm tra lại email!"
                    );
                  }
                }}
              >
                Thêm
              </button>
            </div>

            <style>
              {`
                .animate-fadeIn {
                  animation: fadeInModal 0.2s ease-out;
                }
                @keyframes fadeInModal {
                  from { transform: scale(0.95); opacity: 0; }
                  to { transform: scale(1); opacity: 1; }
                }
              `}
            </style>
          </div>
        </div>
      )}
    </div>
  );
}
