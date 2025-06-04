import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import CategoryCard from "./CategoryCard";
import avatarDefault from "../assets/avatar.jpg";
import axios from "axios";

// Đổi tên prop onWithdrawSuccess thành onTransactionRecorded cho nhất quán
const RecordModal = ({
  onClose,
  onTransactionRecorded,
  selectedCategoryId,
}) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState(selectedCategoryId || "");
  const [categories, setCategories] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState("personalFund");
  const [loggedInUser, setLoggedInUser] = useState(null);

  // State cho Nhóm
  const [availableGroups, setAvailableGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedGroupActualBalance, setSelectedGroupActualBalance] =
    useState(0);
  const [loadingGroupBalance, setLoadingGroupBalance] = useState(false);

  // State để lưu fund_id sẽ được dùng để ghi chú/phân loại khi chi tiêu nhóm
  // Vì GroupExpenseSchema yêu cầu fund_id
  const [fundIdForCategorization, setFundIdForCategorization] = useState("");
  const [categorizationFundName, setCategorizationFundName] = useState("");

  const [selectedTab, setSelectedTab] = useState("category");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setLoggedInUser(parsedUser);

      axios
        .get(`http://localhost:3000/api/auth/groups?userId=${parsedUser._id}`)
        .then((res) => {
          setAvailableGroups(res.data.groups || []);
        })
        .catch((err) => console.error("Lỗi lấy danh sách nhóm:", err));
    }

    axios
      .get("http://localhost:3000/api/admin/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  // Khi chọn nhóm hoặc đổi phương thức thanh toán
  useEffect(() => {
    setSelectedGroupActualBalance(0);
    setFundIdForCategorization("");
    setCategorizationFundName("");

    if (selectedGroupId && paymentMethod === "groupFund") {
      setLoadingGroupBalance(true);
      axios
        .get(
          `http://localhost:3000/api/auth/groups/${selectedGroupId}/actual-balance`
        )
        .then((res) => {
          console.log("API Response for group balance:", res.data); // DEBUG LOG
          setSelectedGroupActualBalance(res.data.balance || 0);
        })
        .catch((err) => {
          console.error(
            "Lỗi lấy số dư tổng của nhóm:",
            err.response ? err.response.data : err.message
          ); // DEBUG LOG
          setSelectedGroupActualBalance(0);
        })
        .finally(() => setLoadingGroupBalance(false));

      // Lấy quỹ đầu tiên của nhóm (hoặc quỹ tên "Quỹ chung") để dùng cho fund_id khi tạo GroupExpense
      // vì GroupExpenseSchema yêu cầu fund_id. Mục đích chính là để phân loại.
      axios
        .get(
          `http://localhost:3000/api/auth/group-funds?groupId=${selectedGroupId}`
        )
        .then((res) => {
          const funds = res.data.funds || [];
          if (funds.length > 0) {
            let targetFund = funds.find(
              (f) =>
                f.name.toLowerCase().includes("chung") ||
                f.name.toLowerCase().includes("general")
            );
            if (!targetFund) {
              targetFund = funds[0]; // Lấy quỹ đầu tiên nếu không có "Quỹ chung"
            }
            setFundIdForCategorization(targetFund._id);
            setCategorizationFundName(targetFund.name);
          } else {
            // Nếu nhóm không có quỹ nào, cần xử lý (ví dụ: không cho phép chi tiêu nhóm)
            // Hoặc backend cho phép tạo GroupExpense mà không cần fund_id nếu đó là chi tiêu chung của nhóm
            // Hiện tại, GroupExpenseSchema yêu cầu fund_id
            console.warn(
              "Nhóm này không có quỹ nào để dùng cho việc phân loại chi tiêu."
            );
          }
        })
        .catch((err) => console.error("Lỗi lấy quỹ để phân loại:", err));
    }
  }, [selectedGroupId, paymentMethod]);

  // Nếu selectedCategoryId thay đổi khi mở modal, cập nhật state
  useEffect(() => {
    if (selectedCategoryId) setCategory(selectedCategoryId);
  }, [selectedCategoryId]);

  const handleCategoryClick = (id) => setCategory(id);

  const handleSaveTransaction = async () => {
    if (!amount || Number(amount) <= 0) {
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

    const transactionAmount = Number(amount);
    const selectedCategoryObj = categories.find((cat) => cat._id === category);
    const categoryName = selectedCategoryObj
      ? selectedCategoryObj.name
      : "Không rõ";
    let successMessage = "";
    let transactionType = "personal";
    let personalBalanceDelta = -transactionAmount;

    try {
      if (paymentMethod === "personalFund") {
        await axios.post("http://localhost:3000/api/auth/Withdraw", {
          user_id: loggedInUser._id,
          amount: transactionAmount,
          category_id: category,
          source: categoryName,
          note: description,
          transaction_date: date,
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
          alert(
            "Nhóm này cần có ít nhất một quỹ (ví dụ: 'Quỹ chung') để có thể ghi nhận chi tiêu theo yêu cầu của hệ thống. Vui lòng tạo quỹ cho nhóm."
          );
          return;
        }
        if (transactionAmount > selectedGroupActualBalance) {
          alert(
            `Số dư tài khoản nhóm không đủ! Số dư hiện tại của nhóm: ${selectedGroupActualBalance.toLocaleString()} đ`
          );
          return;
        }

        await axios.post("http://localhost:3000/api/auth/group-expenses", {
          fund_id: fundIdForCategorization,
          user_making_expense_id: loggedInUser._id,
          date: date,
          description: description,
          category_id: category,
          amount: transactionAmount,
        });
        const selectedGroup = availableGroups.find(
          (g) => g._id === selectedGroupId
        );
        successMessage = `Chi từ tài khoản nhóm ${
          selectedGroup?.name || ""
        } (Phân loại vào quỹ: ${categorizationFundName}): ${
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
      alert("Ghi chép thành công!");
      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Lỗi không xác định";
      console.error(
        `Lỗi khi ghi chép (${paymentMethod}):`,
        errorMessage,
        err.response
      );
      alert(`Ghi chép thất bại: ${errorMessage}`);
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
            onClick={handleSaveTransaction}
          >
            Lưu
          </button>
        </div>

        {/* Phương Thức */}
        <div className="flex justify-between items-center border-b py-3 mb-3">
          <span className="text-gray-600 font-medium">Phương Thức</span>
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              if (e.target.value === "personalFund") {
                setSelectedGroupId("");
              }
            }}
            className="text-sm text-gray-700 outline-none p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="personalFund">Tiền cá nhân</option>
            <option value="groupFund">Chi tiêu nhóm</option>
          </select>
        </div>

        {/* Tab lựa chọn */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              selectedTab === "user"
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => setSelectedTab("user")}
          >
            {paymentMethod === "groupFund" ? "Chọn Nhóm" : "Người sử dụng"}
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

        {/* Nội dung Tab */}
        {selectedTab === "user" && (
          <div className="mb-4">
            {paymentMethod === "personalFund" && loggedInUser ? (
              <>
                <h2 className="font-semibold text-sm text-gray-600 mb-2">
                  Thực hiện bởi (Cá nhân)
                </h2>
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg shadow-sm">
                  <img
                    src={loggedInUser.avatar || avatarDefault}
                    alt={loggedInUser.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-indigo-700">
                      {loggedInUser.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {loggedInUser.email}
                    </p>
                  </div>
                </div>
              </>
            ) : paymentMethod === "groupFund" ? (
              <div className="space-y-3">
                <h2 className="font-semibold text-sm text-gray-600 mb-2">
                  Chi Tiêu Từ Tài Khoản Nhóm
                </h2>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium text-sm">
                    Nhóm
                  </span>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="text-sm text-gray-700 outline-none p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 w-2/3"
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
                    <div className="text-sm text-gray-500 mt-2">
                      Số dư tài khoản nhóm:{" "}
                      {loadingGroupBalance ? (
                        "Đang tải..."
                      ) : (
                        <span className="font-semibold text-indigo-600">
                          {selectedGroupActualBalance.toLocaleString()} đ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
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

        {selectedTab === "category" && (
          <div className="mb-4">
            <h2 className="font-semibold text-sm text-gray-600 mb-2">
              Danh mục
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat._id}
                  icon={cat.icon || "📁"}
                  label={cat.name}
                  onClick={() => handleCategoryClick(cat._id)}
                  selected={category === cat._id}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4">
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
