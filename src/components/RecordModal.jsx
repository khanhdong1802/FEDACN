import React, { useState, useEffect } from "react";
import {
  X,
  GraduationCap,
  Utensils,
  Bed,
  Home,
  Car,
  Calculator,
} from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import avatarDefault from "../assets/avatar.jpg";

// local small helpers to avoid missing ui/* and lib/utils imports
const cn = (...classes) => classes.filter(Boolean).join(" ");

const Button = ({ children, className = "", variant, ...rest }) => (
  <button
    {...rest}
    className={cn(
      "inline-flex items-center justify-center px-3 py-1.5 rounded-md",
      className
    )}
  >
    {children}
  </button>
);

const Input = ({ className = "", ...props }) => (
  <input {...props} className={cn("px-3 py-2 rounded-md w-full", className)} />
);

const Label = ({ children, className = "" }) => (
  <label className={cn("block text-sm font-medium mb-1", className)}>
    {children}
  </label>
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    {...props}
    className={cn("px-3 py-2 rounded-md w-full", className)}
  />
);

const iconMap = {
  "Học phí": GraduationCap,
  "Thức ăn": Utensils,
  "Tiền ngu": Bed,
  "Tiền nhà": Home,
  "Đi lại": Car,
  "Đồ dùng": Calculator,
};

const gradientMap = {
  "Học phí": "from-purple-500 to-purple-600",
  "Thức ăn": "from-pink-500 to-rose-500",
  "Tiền ngu": "from-blue-500 to-cyan-500",
  "Tiền nhà": "from-orange-500 to-amber-500",
  "Đi lại": "from-cyan-500 to-teal-500",
  "Đồ dùng": "from-indigo-500 to-violet-500",
};

const RecordModal = ({
  onClose,
  onTransactionRecorded,
  selectedCategoryId,
}) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState(selectedCategoryId || "");
  const [categories, setCategories] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("personalFund");
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Group-related states
  const [availableGroups, setAvailableGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedGroupActualBalance, setSelectedGroupActualBalance] =
    useState(0);
  const [loadingGroupBalance, setLoadingGroupBalance] = useState(false);
  const [fundIdForCategorization, setFundIdForCategorization] = useState("");
  const [categorizationFundName, setCategorizationFundName] = useState("");

  // Tab: user / category
  const [tabValue, setTabValue] = useState("category");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setLoggedInUser(parsedUser);

      axios
        .get(`http://localhost:3000/api/group/groups?userId=${parsedUser._id}`)
        .then((res) => setAvailableGroups(res.data.groups || []))
        .catch(() => setAvailableGroups([]));
    }

    axios
      .get("http://localhost:3000/api/admin/categories")
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    // when selectedCategoryId prop changes (opened from elsewhere)
    if (selectedCategoryId) setCategory(selectedCategoryId);
  }, [selectedCategoryId]);

  // Khi chọn nhóm hoặc đổi phương thức thanh toán
  useEffect(() => {
    if (selectedGroupId && paymentMethod === "groupFund") {
      setLoadingGroupBalance(true);
      axios
        .get(
          `http://localhost:3000/api/group/groups/${selectedGroupId}/actual-balance`
        )
        .then((res) => setSelectedGroupActualBalance(res.data.balance || 0))
        .catch(() => setSelectedGroupActualBalance(0))
        .finally(() => setLoadingGroupBalance(false));

      axios
        .get(
          `http://localhost:3000/api/group/group-funds?groupId=${selectedGroupId}`
        )
        .then((res) => {
          const funds = res.data.funds || [];
          if (funds.length > 0) {
            let targetFund = funds.find(
              (f) =>
                f.name.toLowerCase().includes("chung") ||
                f.name.toLowerCase().includes("general")
            );
            if (!targetFund) targetFund = funds[0];
            setFundIdForCategorization(targetFund._id);
            setCategorizationFundName(targetFund.name);
          } else {
            setFundIdForCategorization("");
            setCategorizationFundName("");
          }
        })
        .catch(() => {
          setFundIdForCategorization("");
          setCategorizationFundName("");
        });
    } else {
      setSelectedGroupActualBalance(0);
      setFundIdForCategorization("");
      setCategorizationFundName("");
    }
  }, [selectedGroupId, paymentMethod]);

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

  const handleCategoryClick = (id) => setCategory(id);

  const handleSaveTransaction = async () => {
    if (!amount || Number(amount.replace(/,/g, "")) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ!");
      return;
    }
    if (!category) {
      alert("Vui lòng chọn danh mục!");
      return;
    }
    if (!loggedInUser?._id) {
      alert("Không tìm thấy thông tin người dùng!");
      return;
    }

    const transactionAmount = Number(amount.replace(/,/g, ""));
    const selectedCategoryObj = categories.find((cat) => cat._id === category);
    const categoryName = selectedCategoryObj
      ? selectedCategoryObj.name
      : "Không rõ";
    let successMessage = "";
    let transactionType = "personal";
    let personalBalanceDelta = -transactionAmount;

    try {
      if (paymentMethod === "personalFund") {
        await axios.post("http://localhost:3000/api/withdraw", {
          user_id: loggedInUser._id,
          amount: transactionAmount,
          category_id: category,
          source: categoryName,
          note: description,
          transaction_date: format(date, "yyyy-MM-dd"),
          payment_method: paymentMethod,
        });
        successMessage = `Ghi chi tiêu (Cá nhân): ${
          description || categoryName
        } - ${transactionAmount.toLocaleString()} đ.`;
        transactionType = "personal";
      } else if (paymentMethod === "groupFund") {
        if (!selectedGroupId) {
          alert("Vui lòng chọn nhóm để chi tiêu!");
          return;
        }
        if (!fundIdForCategorization) {
          alert("Nhóm cần có quỹ để phân loại chi tiêu.");
          return;
        }
        if (transactionAmount > selectedGroupActualBalance) {
          alert(
            `Số dư nhóm không đủ: ${selectedGroupActualBalance.toLocaleString()} đ`
          );
          return;
        }

        await axios.post("http://localhost:3000/api/group/group-expenses", {
          fund_id: fundIdForCategorization,
          user_making_expense_id: loggedInUser._id,
          date: format(date, "yyyy-MM-dd"),
          description: description,
          category_id: category,
          amount: transactionAmount,
        });

        const selectedGroup = availableGroups.find(
          (g) => g._id === selectedGroupId
        );
        successMessage = `Chi từ nhóm ${
          selectedGroup?.name || ""
        } (quỹ: ${categorizationFundName}): ${
          description || categoryName
        } - ${transactionAmount.toLocaleString()} đ.`;
        transactionType = "groupFundDirect";
        personalBalanceDelta = 0;
      } else {
        alert("Phương thức thanh toán không hợp lệ!");
        return;
      }

      if (onTransactionRecorded) {
        onTransactionRecorded(
          successMessage,
          personalBalanceDelta,
          transactionType
        );
      }

      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Lỗi không xác định";
      console.error("Lỗi khi ghi chép:", err);
      alert(`Ghi chép thất bại: ${errorMessage}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="w-full max-w-sm mx-4 rounded-2xl p-6 shadow-xl animate-scale-in bg-white"
        style={{
          maxHeight: "80%",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold">Ghi chép</h3>
          <Button
            onClick={handleSaveTransaction}
            className="text-sm bg-indigo-600 text-white"
          >
            Lưu
          </Button>
        </div>

        {/* Phương thức */}
        <div className="mb-4">
          <Label>Phương thức</Label>
          <select
            value={paymentMethod}
            onChange={(e) => {
              const v = e.target.value;
              setPaymentMethod(v);
              if (v === "personalFund") setSelectedGroupId("");
            }}
            className="w-full glass-card border-none p-2 rounded-md"
          >
            <option value="personalFund">Tiền cá nhân</option>
            <option value="groupFund">Chi tiêu nhóm</option>
          </select>
        </div>

        {/* Tabs: Người sử dụng / Danh mục */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            className={cn(
              "px-4 py-1 rounded-full text-xs font-medium",
              tabValue === "user"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-600"
            )}
            onClick={() => setTabValue("user")}
          >
            {paymentMethod === "groupFund" ? "Chọn nhóm" : "Người sử dụng"}
          </button>
          <button
            className={cn(
              "px-4 py-1 rounded-full text-xs font-medium",
              tabValue === "category"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-600"
            )}
            onClick={() => setTabValue("category")}
          >
            Danh mục
          </button>
        </div>

        {/* Tab: Người sử dụng / Nhóm */}
        {tabValue === "user" && (
          <div className="mb-4">
            {paymentMethod === "personalFund" && loggedInUser ? (
              <>
                <p className="text-xs text-gray-600 mb-2">
                  Thực hiện bởi (Cá nhân)
                </p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50">
                  <img
                    src={loggedInUser.avatar || avatarDefault}
                    alt={loggedInUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-indigo-700">
                      {loggedInUser.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {loggedInUser.email}
                    </p>
                  </div>
                </div>
              </>
            ) : paymentMethod === "groupFund" ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600">
                  Chi tiêu từ tài khoản nhóm
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-600">Nhóm</span>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="text-xs w-2/3 glass-card border border-gray-200 p-2 rounded-md"
                    disabled={availableGroups.length === 0}
                  >
                    <option value="">-- Chọn nhóm --</option>
                    {availableGroups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedGroupId && (
                  <>
                    <div className="text-xs text-gray-500">
                      Số dư tài khoản nhóm:{" "}
                      {loadingGroupBalance ? (
                        "Đang tải..."
                      ) : (
                        <span className="font-semibold text-indigo-600">
                          {selectedGroupActualBalance.toLocaleString()} đ
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      (Chi tiêu sẽ được phân loại vào quỹ:{" "}
                      <span className="italic">
                        {categorizationFundName || "Chưa xác định"}
                      </span>
                      )
                    </p>
                  </>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Tab: Danh mục */}
        {tabValue === "category" && (
          <div className="mb-4">
            <Label className="mb-3">Danh mục</Label>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((cat) => {
                const IconComp = iconMap[cat.name] || Calculator;
                const gradient =
                  gradientMap[cat.name] || "from-gray-300 to-gray-400";
                const isSelected = category === cat._id;
                return (
                  <button
                    key={cat._id}
                    onClick={() => handleCategoryClick(cat._id)}
                    className={cn(
                      "flex-shrink-0 flex flex-col items-center gap-2",
                      "focus:outline-none"
                    )}
                  >
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-gradient-to-br",
                        gradient,
                        isSelected
                          ? "scale-105 shadow-glow"
                          : "opacity-80 hover:opacity-100 hover:scale-105"
                      )}
                    >
                      <IconComp
                        className="w-7 h-7 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Số tiền */}
        <div className="mb-4">
          <Label>Số tiền</Label>
          <div className="relative mt-2">
            <Input
              type="text"
              value={formatNumber(amount)}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/,/g, "");
                if (!isNaN(rawValue) || rawValue === "") {
                  setAmount(rawValue);
                }
              }}
              placeholder="Nhập số tiền"
              className="glass-card border-none pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
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
                        onClick={() => {
                          setAmount(amt.toString());
                        }}
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

        {/* Ngày */}
        <div className="mb-4">
          <Label>Ngày</Label>
          <div className="mt-2">
            <input
              type="date"
              value={format(date, "yyyy-MM-dd")}
              onChange={(e) => setDate(new Date(e.target.value))}
              className="w-full glass-card border-none p-2 rounded-md"
            />
          </div>
        </div>

        {/* Mô tả */}
        <div className="mb-2">
          <Label>Mô tả</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Thêm ghi chú..."
            className="glass-card border-none resize-none"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default RecordModal;
