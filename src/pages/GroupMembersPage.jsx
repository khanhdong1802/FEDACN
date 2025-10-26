import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function GroupMembersPage() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const [groupInfo, setGroupInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const menuRef = useRef();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Lấy thông tin nhóm
      const resGroup = await fetch(`http://localhost:3000/api/auth/${groupId}`);
      const group = await resGroup.json();

      // Lấy số dư nhóm
      const resActualBalance = await fetch(
        `http://localhost:3000/api/auth/groups/${groupId}/actual-balance`
      );
      const actualBalanceData = await resActualBalance.json();

      setGroupInfo({
        ...group,
        balance: actualBalanceData.balance,
        totalSpent: actualBalanceData.totalSpent,
      });

      // Lấy danh sách thành viên kèm đã chi
      const resMembers = await fetch(
        `http://localhost:3000/api/auth/groups/${groupId}/member-expenses`
      );
      const data = await resMembers.json();
      setMembers(data.members || []);
      setLoading(false);
    }
    fetchData();
  }, [groupId]);

  // Giả sử bạn có API lấy số dư và tổng chi tiêu từng thành viên, nếu chưa có thì cần backend hỗ trợ
  // Ở đây sẽ giả lập dữ liệu số dư và tổng chi tiêu
  const membersWithSpent = members.map((mem) => ({
    ...mem,
    // Nếu backend trả về mem.totalSpent thì dùng, nếu không thì mặc định 0
    totalSpent: mem.totalSpent || 0,
  }));

  // Sắp xếp theo balance giảm dần để xếp hạng
  const sortedMembers = [...membersWithSpent].sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;
  const isLeader = groupInfo?.created_by === currentUserId; // hoặc so sánh với userId hiện tại

  // Đóng menu khi click ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-700 text-white">
      <div className="flex items-center px-4 py-3 relative">
        <button
          onClick={() => navigate(-1)}
          className="mr-2 text-white text-xl"
        >
          &lt;
        </button>
        <div className="flex-1 text-center font-bold text-lg">
          {groupInfo?.name || "Tên nhóm"}
        </div>
        {/* Nút menu dọc */}
        {isLeader && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="text-white text-2xl px-2"
              title="Quản lý thành viên"
            >
              &#8942;
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded shadow-lg z-10 text-gray-800">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setShowMenu(false);
                    setShowAddModal(true);
                  }}
                >
                  Thêm thành viên
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-center gap-8 mt-6">
        {/* Top 3 thành viên */}
        {sortedMembers.slice(0, 3).map((mem, idx) => (
          <div key={mem.user_id} className="flex flex-col items-center">
            <div
              className={`w-20 h-20 rounded-full border-4 ${
                idx === 0 ? "border-yellow-400" : "border-gray-300"
              } overflow-hidden bg-white`}
            >
              <span className="text-4xl flex items-center justify-center h-full w-full text-indigo-700">
                {mem.name?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
            <div className="mt-2 font-semibold">{mem.name}</div>
            <div className="text-xs text-gray-200">
              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
            </div>
          </div>
        ))}
      </div>

      {/* Số dư nhóm */}
      <div className="text-center mt-4 mb-2 text-lg font-semibold text-white">
        Số dư nhóm:{" "}
        {loading ? "Đang tải..." : groupInfo?.balance?.toLocaleString() || 0} đ
      </div>

      <div className="bg-white rounded-t-3xl mt-8 p-4 text-gray-800">
        <h3 className="font-bold mb-2">Danh sách thành viên</h3>
        {/* Danh sách thành viên */}
        {sortedMembers.map((mem, idx) => (
          <div
            key={mem.user_id}
            className="flex items-center gap-3 py-2 border-b last:border-b-0"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-700">
              {mem.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="flex-1">
              <div className="font-semibold">
                {mem.name}
                {groupInfo?.created_by === mem.user_id && (
                  <span className="ml-2 text-xs text-purple-600">
                    (Trưởng phòng)
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">{mem.email}</div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="text-xs text-gray-500">
                Đã chi: {mem.totalSpent?.toLocaleString()} đ
              </div>
              {isLeader && mem.user_id !== groupInfo?.created_by && (
                <button
                  className="text-xs text-red-500 hover:underline mt-1"
                  onClick={async () => {
                    if (
                      window.confirm("Bạn chắc chắn muốn xóa thành viên này?")
                    ) {
                      await fetch(
                        `http://localhost:3000/api/auth/groups/${groupId}/members/${mem.user_id}`,
                        { method: "DELETE" }
                      );
                      // Reload lại danh sách
                      const resMembers = await fetch(
                        `http://localhost:3000/api/auth/groups/${groupId}/member-expenses`
                      );
                      const data = await resMembers.json();
                      setMembers(data.members || []);
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
      {/* Tabs nếu muốn */}
      <div className="flex justify-center mt-4">
        <button className="px-6 py-2 rounded-l-full bg-white text-indigo-700 font-semibold">
          Thành viên
        </button>
        <button className="px-6 py-2 rounded-r-full bg-gray-200 text-gray-500 font-semibold">
          Danh mục
        </button>
      </div>
      {loading && (
        <div className="text-center text-white py-8 text-lg">Đang tải...</div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-30 transition-all">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80 animate-fadeIn relative">
            <h3 className="font-bold text-lg mb-4 text-indigo-700 flex items-center gap-2">
              <span className="inline-block bg-indigo-100 text-indigo-700 rounded-full p-2">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z"
                    fill="#6366F1"
                  />
                </svg>
              </span>
              Thêm thành viên
            </h3>
            <input
              type="email"
              className="border border-indigo-300 focus:border-indigo-500 outline-none px-3 py-2 rounded w-full mb-3 transition text-gray-800"
              placeholder="Nhập email thành viên"
              value={inviteEmail}
              onChange={async (e) => {
                setInviteEmail(e.target.value);
                // Gợi ý email
                if (e.target.value.trim()) {
                  const res = await fetch(
                    `http://localhost:3000/api/auth/search?q=${e.target.value}`
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
              <div className="bg-white border rounded shadow mt-1 max-h-40 overflow-y-auto absolute left-0 right-0 z-40">
                {emailSuggestions.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    className="flex items-center w-full px-3 py-2 hover:bg-indigo-50 transition text-left"
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
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-4 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                onClick={() => setShowAddModal(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-1 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
                disabled={!inviteEmail}
                onClick={async () => {
                  const res = await fetch(
                    `http://localhost:3000/api/auth/groups/${groupId}/members`,
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
                    // Reload lại danh sách
                    const resMembers = await fetch(
                      `http://localhost:3000/api/auth/groups/${groupId}/member-expenses`
                    );
                    const data = await resMembers.json();
                    setMembers(data.members || []);
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
                animation: fadeInModal 0.2s;
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
