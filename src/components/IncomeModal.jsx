// src/components/IncomeModal.jsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// mini UI
const Label = ({ children, className = "", ...props }) => (
  <label
    className={cn("block text-sm font-medium text-gray-800 mb-1", className)}
    {...props}
  >
    {children}
  </label>
);

const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={cn(
      "w-full px-3 py-2 rounded-2xl border border-white/70 bg-white/90 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500",
      className
    )}
  />
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    {...props}
    className={cn(
      "w-full px-3 py-2 rounded-2xl border border-white/70 bg-white/90 text-sm text-gray-900 resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500",
      className
    )}
  />
);

const Button = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={cn(
      "inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold transition-all focus:outline-none",
      className
    )}
  >
    {children}
  </button>
);

// Đảm bảo IncomeModal nhận prop onIncomeSuccess từ FloatingButton
const IncomeModal = ({ onClose, onSuccess, groupId, onIncomeSuccess }) => {
  const [mode, setMode] = useState("personal");
  const [groups, setGroups] = useState([]);
  const [groupFunds, setGroupFunds] = useState([]);
  const [groupFundName, setGroupFundName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(groupId || "");
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
      fetch(`http://localhost:3000/api/group/groups?userId=${user._id}`)
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
          setMode("group");
        }
      }
    }
  }, [groupId, groups, selectedGroupId, mode]);

  useEffect(() => {
    if (selectedGroupId && mode === "group") {
      fetch(
        `http://localhost:3000/api/group/group-funds?groupId=${selectedGroupId}`
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

  const getAmountSuggestions = () => {
    if (!amount || isNaN(amount) || amount <= 0) return [];
    const num = parseInt(amount.replace(/,/g, ""));
    return [num * 1000, num * 10000, num * 100000].filter((s) => s <= 10000000);
  };

  const formatNumber = (value) => {
    if (!value) return "";
    const num = value.replace(/,/g, "");
    if (isNaN(num)) return value;
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleAddFund = async () => {
    if (!newFundName.trim() || !selectedGroupId) return;
    try {
      const res = await fetch("http://localhost:3000/api/group/group-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: selectedGroupId,
          name: newFundName.trim(),
        }),
      });
      const newFundData = await res.json();
      console.log("Kết quả thêm quỹ:", newFundData);

      if (res.ok && newFundData && newFundData._id) {
        setGroupFunds((prev) => [...prev, newFundData]);
        setGroupFundName(newFundData.name);
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
    const numericAmount = Number(amount.replace(/,/g, ""));
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
      let amountDeltaForNavbar = numericAmount;

      if (mode === "personal") {
        payload.user_id = user._id;
        apiUrl = "http://localhost:3000/api/auth/Income";
        successMessage = `Nạp tiền cá nhân thành công: ${numericAmount.toLocaleString()} đ từ ${source}.`;
        transactionType = "personalIncome";
      } else {
        payload.group_id = selectedGroupId;
        payload.fund_name = groupFundName.trim();
        payload.member_id = user._id;
        payload.payment_method = "cash";
        apiUrl = "http://localhost:3000/api/group/group-contributions";

        const selectedGroup = groups.find((g) => g._id === selectedGroupId);
        successMessage = `Nạp ${numericAmount.toLocaleString()} đ vào quỹ "${groupFundName}" của nhóm "${
          selectedGroup?.name || ""
        }" thành công.`;
        amountDeltaForNavbar = -numericAmount;
        transactionType = "personal";
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert(successMessage);
        if (onIncomeSuccess) {
          onIncomeSuccess(
            successMessage,
            amountDeltaForNavbar,
            transactionType
          );
        }
        if (onSuccess) onSuccess();
        onClose();
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      {/* CARD: ít trong suốt hơn + cuộn nội dung */}
      <div className="relative w-full max-w-md mx-4 rounded-3xl bg-white/95 border border-white/80 shadow-xl flex flex-col max-h-[90vh]">
        {/* Header + Tabs (không cuộn) */}
        <div className="px-6 pt-5 pb-4 border-b border-white/70 flex flex-col gap-4 shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Ghi thu nhập
            </h1>
            <Button
              onClick={handleSave}
              disabled={loading}
              className={cn(
                "text-white bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600",
                loading && "opacity-60 cursor-not-allowed"
              )}
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>

          {/* Tabs Cá nhân / Nhóm */}
          <div className="glass-card bg-white/40 border border-white/70 rounded-full p-1 flex">
            <button
              type="button"
              onClick={() => setMode("personal")}
              className={cn(
                "flex-1 px-4 py-1.5 text-sm font-medium rounded-full transition-all",
                mode === "personal"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500"
              )}
            >
              Cá nhân
            </button>
            <button
              type="button"
              onClick={() => setMode("group")}
              className={cn(
                "flex-1 px-4 py-1.5 text-sm font-medium rounded-full transition-all",
                mode === "group"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500"
              )}
            >
              Nhóm
            </button>
          </div>

          {errorMessage && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
              {errorMessage}
            </div>
          )}
        </div>

        {/* CONTENT: phần này cuộn được */}
        <div className="px-6 pb-5 pt-4 flex-1 overflow-y-auto space-y-4">
          {/* Số tiền */}
          <div>
            <Label>Số tiền</Label>
            <div className="relative">
              <Input
                type="text"
                value={formatNumber(amount)}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/,/g, "");
                  if (!isNaN(rawValue) || rawValue === "") {
                    setAmount(rawValue);
                  }
                }}
                placeholder="0"
                className="pr-10 text-right"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                đ
              </span>
              {amount && getAmountSuggestions().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="p-2">
                    <p className="text-xs text-gray-500 mb-2">Gợi ý số tiền:</p>
                    <div className="flex flex-wrap gap-2">
                      {getAmountSuggestions().map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setAmount(amt.toString())}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          {amt.toLocaleString()} đ
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nguồn thu */}
          <div>
            <Label>Nguồn thu</Label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border border-white/70 bg-white/90 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <div>
            <Label>Ngày nhận</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Nhóm & Quỹ (mode Nhóm) */}
          {mode === "group" && (
            <>
              <div>
                <Label>Chọn nhóm</Label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => {
                    setSelectedGroupId(e.target.value);
                    setGroupFundName("");
                  }}
                  className="w-full px-3 py-2 rounded-2xl border border-white/70 bg-white/90 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

              <div>
                <Label>Chọn quỹ nhóm</Label>
                <select
                  value={groupFundName}
                  onChange={(e) => setGroupFundName(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border border-white/70 bg-white/90 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

              <div className="flex gap-2 items-center">
                <Input
                  type="text"
                  value={newFundName}
                  onChange={(e) => setNewFundName(e.target.value)}
                  placeholder="Tên quỹ mới"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddFund}
                  disabled={!newFundName.trim() || !selectedGroupId}
                  className={cn(
                    "bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600 px-4",
                    (!newFundName.trim() || !selectedGroupId) &&
                      "opacity-60 cursor-not-allowed"
                  )}
                >
                  Thêm quỹ
                </Button>
              </div>
            </>
          )}

          {/* Ghi chú */}
          <div className="pb-1">
            <Label>Ghi chú thêm (nếu có)</Label>
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Thêm ghi chú..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeModal;
