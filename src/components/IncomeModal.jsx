import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const IncomeModal = ({ onClose, onSuccess, groupId }) => {
  const [mode, setMode] = useState("personal");
  const [groups, setGroups] = useState([]);
  const [groupFunds, setGroupFunds] = useState([]); // Danh sách quỹ nhóm
  const [groupFundName, setGroupFundName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newFundName, setNewFundName] = useState(""); // Tên quỹ mới nhập

  const predefinedSources = ["Lương", "Bán đồ", "Quà", "Khác"];
  const user = JSON.parse(localStorage.getItem("user"));

  // Lấy danh sách nhóm
  useEffect(() => {
    if (user?._id) {
      fetch(`http://localhost:3000/api/auth/groups?userId=${user._id}`)
        .then((res) => res.json())
        .then((data) => {
          setGroups(data.groups || []);
        })
        .catch((err) => console.error("Lỗi khi lấy danh sách nhóm:", err));
    }
  }, [user._id]);

  // Lấy danh sách quỹ nhóm khi chọn nhóm
  useEffect(() => {
    if (selectedGroupId) {
      fetch(
        `http://localhost:3000/api/auth/group-funds?groupId=${selectedGroupId}`
      )
        .then((res) => res.json())
        .then((data) => {
          setGroupFunds(
            Array.isArray(data.funds)
              ? data.funds.filter((f) => f && f.name)
              : []
          );
        })
        .catch((err) => console.error("Lỗi khi lấy danh sách quỹ nhóm:", err));
    } else {
      setGroupFunds([]);
    }
  }, [selectedGroupId]);

  // Hàm thêm quỹ mới
  const handleAddFund = async () => {
    if (!newFundName.trim() || !selectedGroupId) return;
    try {
      const res = await fetch("http://localhost:3000/api/auth/group-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: selectedGroupId,
          name: newFundName.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setGroupFunds((prev) => [...prev, data.fund]);
        setGroupFundName(data.fund.name);
        setNewFundName("");
      } else {
        alert(data.error || "Không thể thêm quỹ mới");
      }
    } catch (err) {
      alert("Lỗi khi thêm quỹ mới");
    }
  };

  const handleSave = async () => {
    if (
      !amount ||
      !source ||
      (mode === "group" && (!selectedGroupId || !groupFundName.trim()))
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        amount,
        source,
        received_date: date,
        note,
        status: "pending",
      };

      let apiUrl = "";

      if (mode === "personal") {
        payload.user_id = user._id;
        apiUrl = "http://localhost:3000/api/auth/Income";
      } else {
        payload.group_id = selectedGroupId;
        payload.fund_name = groupFundName.trim();
        payload.member_id = user._id;
        payload.payment_method = "cash";
        apiUrl = "http://localhost:3000/api/auth/group-contributions";
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Nạp tiền thành công!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMessage(result.message || "Đã xảy ra lỗi khi nạp tiền");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      setErrorMessage("Lỗi khi gửi dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-2">
          <button onClick={onClose}>
            <X size={24} />
          </button>
          <h1 className="text-lg font-medium">Ghi thu nhập</h1>
          <button
            className="text-purple-600 font-medium"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>

        {/* Chọn chế độ */}
        <div className="flex justify-around py-2 border-b">
          <button
            className={`px-4 py-1 rounded-full ${
              mode === "personal" ? "bg-purple-200" : "bg-gray-100"
            }`}
            onClick={() => setMode("personal")}
          >
            Cá nhân
          </button>
          <button
            className={`px-4 py-1 rounded-full ${
              mode === "group" ? "bg-purple-200" : "bg-gray-100"
            }`}
            onClick={() => setMode("group")}
          >
            Nhóm
          </button>
        </div>

        {errorMessage && (
          <div className="text-red-500 text-sm mb-4 mt-2">{errorMessage}</div>
        )}

        {/* Form */}
        <div className="flex flex-col gap-4 mt-2">
          {/* Số tiền */}
          <div className="flex justify-between items-center border-b py-2">
            <span className="text-gray-500">Số tiền</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="text-right w-1/2 text-gray-700 outline-none"
            />
          </div>

          {/* Nguồn thu */}
          <div className="flex justify-between items-center border-b py-2">
            <span className="text-gray-500">Nguồn thu</span>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="text-right w-1/2 text-gray-700 outline-none bg-transparent"
            >
              <option value="" disabled>
                Chọn nguồn thu
              </option>
              {predefinedSources.map((src, idx) => (
                <option key={idx} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          {/* Ngày nhận */}
          <div className="flex justify-between items-center border-b py-2">
            <span className="text-gray-500">Ngày nhận</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-gray-700 outline-none"
            />
          </div>

          {/* Nhóm & Quỹ */}
          {mode === "group" && (
            <>
              {/* Nhóm */}
              <div className="flex justify-between items-center border-b py-2">
                <span className="text-gray-500">Chọn nhóm</span>
                <select
                  value={selectedGroupId}
                  onChange={(e) => {
                    setSelectedGroupId(e.target.value);
                    setGroupFundName(""); // reset quỹ khi đổi nhóm
                  }}
                  className="text-right w-1/2 text-gray-700 outline-none bg-transparent"
                >
                  <option value="" disabled>
                    Chọn nhóm
                  </option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chọn quỹ nhóm */}
              <div className="flex justify-between items-center border-b py-2">
                <span className="text-gray-500">Chọn quỹ nhóm</span>
                <select
                  value={groupFundName}
                  onChange={(e) => setGroupFundName(e.target.value)}
                  className="text-right w-1/2 text-gray-700 outline-none bg-transparent"
                >
                  <option value="" disabled>
                    Chọn quỹ nhóm
                  </option>
                  {Array.isArray(groupFunds) &&
                    groupFunds
                      .filter((fund) => fund && fund.name)
                      .map((fund) => (
                        <option key={fund._id} value={fund.name}>
                          {fund.name}
                        </option>
                      ))}
                </select>
              </div>

              {/* Thêm quỹ mới */}
              <div className="flex gap-2 items-center mt-1">
                <input
                  type="text"
                  value={newFundName}
                  onChange={(e) => setNewFundName(e.target.value)}
                  placeholder="Tên quỹ mới"
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  className="bg-purple-500 text-white px-3 py-1 rounded text-sm"
                  onClick={handleAddFund}
                  disabled={!newFundName.trim() || !selectedGroupId}
                >
                  Thêm quỹ
                </button>
              </div>
            </>
          )}

          {/* Ghi chú */}
          <div className="border-b py-2">
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-sm text-gray-700 outline-none"
              placeholder="Ghi chú thêm (nếu có)"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeModal;
