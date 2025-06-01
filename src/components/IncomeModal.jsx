// src/components/IncomeModal.jsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

// Đảm bảo IncomeModal nhận prop onIncomeSuccess từ FloatingButton
const IncomeModal = ({
  onClose,
  onSuccess,
  groupId,
  onIncomeSuccessCallback,
}) => {
  const [mode, setMode] = useState("personal");
  const [groups, setGroups] = useState([]);
  const [groupFunds, setGroupFunds] = useState([]);
  const [groupFundName, setGroupFundName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(groupId || ""); // Ưu tiên groupId từ props nếu có
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newFundName, setNewFundName] = useState("");

  const predefinedSources = ["Lương", "Bán đồ", "Quà", "Khác"];
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?._id) {
      fetch(`http://localhost:3000/api/auth/groups?userId=${user._id}`)
        .then((res) => res.json())
        .then((data) => {
          setGroups(data.groups || []);
          if (
            groupId &&
            mode === "group" &&
            !selectedGroupId &&
            data.groups?.find((g) => g._id === groupId)
          ) {
            setSelectedGroupId(groupId);
          }
        })
        .catch((err) => console.error("Lỗi khi lấy danh sách nhóm:", err));
    }
  }, [user?._id, groupId, mode, selectedGroupId]);
  useEffect(() => {
    if (groupId && !selectedGroupId) {
      const groupExists = groups.some((g) => g._id === groupId);
      if (groupExists) {
        setSelectedGroupId(groupId);
        if (
          mode !== "group" &&
          !groups.find((g) => g._id === selectedGroupId)
        ) {
          // Nếu đang personal mà có groupId, chuyển sang group
          setMode("group");
        }
      }
    }
  }, [groupId, groups, selectedGroupId, mode]);

  useEffect(() => {
    if (selectedGroupId && mode === "group") {
      // Chỉ fetch khi ở mode group và đã chọn group
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
        .catch((err) => {
          console.error("Lỗi khi lấy danh sách quỹ nhóm:", err);
          setGroupFunds([]);
        });
    } else {
      setGroupFunds([]);
    }
  }, [selectedGroupId, mode]);

  const handleAddFund = async () => {
    // ... (logic handleAddFund giữ nguyên)
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
      const newFundData = await res.json(); // Đổi tên biến để tránh trùng với data của handleSave
      console.log("Kết quả thêm quỹ:", newFundData);

      if (res.ok && newFundData && newFundData._id) {
        // API trả về object quỹ mới có _id
        setGroupFunds((prev) => [...prev, newFundData]);
        setGroupFundName(newFundData.name); // Chọn luôn quỹ vừa tạo
        setNewFundName("");
      } else {
        alert(
          newFundData.error || newFundData.message || "Không thể thêm quỹ mới"
        );
      }
    } catch (err) {
      alert("Lỗi khi thêm quỹ mới");
    }
  };

  const handleSave = async () => {
    const numericAmount = Number(amount);
    if (
      !numericAmount ||
      numericAmount <= 0 ||
      !source ||
      (mode === "group" && (!selectedGroupId || !groupFundName.trim()))
    ) {
      alert("Vui lòng điền đầy đủ thông tin hợp lệ!");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        amount: numericAmount,
        source,
        received_date: date,
        note,
        status: "pending",
      };

      let apiUrl = "";
      let successMessage = "";
      let transactionType = "";
      let amountDeltaForNavbar = numericAmount; // Số tiền ảnh hưởng đến số dư cá nhân trên Navbar

      if (mode === "personal") {
        payload.user_id = user._id;
        apiUrl = "http://localhost:3000/api/auth/Income";
        successMessage = `Nạp tiền cá nhân thành công: ${numericAmount.toLocaleString()} đ từ ${source}.`;
        transactionType = "personalIncome"; // Thu nhập cá nhân
      } else {
        // mode === "group" (Nạp tiền vào quỹ nhóm)
        payload.group_id = selectedGroupId;
        payload.fund_name = groupFundName.trim();
        payload.member_id = user._id; // Người dùng hiện tại đang nạp tiền vào quỹ nhóm
        payload.payment_method = "cash"; // Hoặc phương thức khác
        apiUrl = "http://localhost:3000/api/auth/group-contributions";

        const selectedGroup = groups.find((g) => g._id === selectedGroupId);
        successMessage = `Nạp ${numericAmount.toLocaleString()} đ vào quỹ "${groupFundName}" của nhóm "${
          selectedGroup?.name || ""
        }" thành công.`;
        // Vì backend API /group-contributions của bạn tạo Income âm (trừ tiền cá nhân)
        // nên amountDelta gửi lên Navbar phải là số âm.
        amountDeltaForNavbar = -numericAmount;
        transactionType = "personal"; // Coi như một chi tiêu cá nhân để nạp vào nhóm
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert(successMessage); // Thông báo cho người dùng

        // Gọi onIncomeSuccess (sẽ được truyền từ FloatingButton -> DashboardNavbar)
        // để cập nhật thông báo và số dư cá nhân trên DashboardNavbar
        if (onIncomeSuccessCallback) {
          onIncomeSuccessCallback(
            successMessage,
            amountDeltaForNavbar,
            transactionType
          );
        }

        // Gọi onSuccess (nếu có, thường từ GroupDashboardPage để fetch lại data nhóm)
        if (onSuccess) {
          onSuccess();
        }

        onClose(); // Đóng modal
      } else {
        setErrorMessage(
          result.message || "Đã xảy ra lỗi khi thực hiện giao dịch"
        );
      }
    } catch (error) {
      console.error("Lỗi khi lưu giao dịch:", error);
      setErrorMessage("Lỗi khi gửi dữ liệu đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... JSX của IncomeModal giữ nguyên ...
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
                    setGroupFundName("");
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
