// src/components/FloatingButton.jsx
import React, { useState } from "react";
import { Wallet, Plus, RotateCcw, Send, NotebookPen } from "lucide-react";
import RecordModal from "./RecordModal";
import IncomeModal from "./IncomeModal";
import DebtModal from "./DebtModal";
import SpendingLimitModal from "./SpendingLimitModal";

// Thêm onNewRecord vào props
const FloatingButton = ({
  groupId,
  onSuccess,
  onIncomeSuccess,
  onNewRecord,
}) => {
  const [open, setOpen] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showSpendingLimitModal, setShowSpendingLimitModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  // Hàm chung để xử lý sau khi một hành động trong modal hoàn tất
  // Nó sẽ gọi onSuccess (nếu có, thường từ GroupDashboardPage để fetch lại data nhóm)
  // và sau đó gọi onNewRecord hoặc onIncomeSuccess (từ DashboardNavbar để cập nhật thông báo/số dư cá nhân)
  const handleActionComplete = (message, amountDelta, transactionType) => {
    if (onSuccess) {
      onSuccess();
    }
    // Gọi callback tương ứng để DashboardNavbar cập nhật
    if (transactionType === "personalIncome" && onIncomeSuccess) {
      onIncomeSuccess(message, amountDelta, transactionType);
    } else if (transactionType && onNewRecord) {
      // "personal" (chi tiêu cá nhân) hoặc "groupFundDirect" (chi từ quỹ nhóm)
      onNewRecord(message, amountDelta, transactionType); // << Quan trọng ở đây
    }
  };

  // Hàm xử lý riêng cho IncomeModal để đảm bảo đúng transactionType
  const handleIncomeModalSuccess = (message, amountAdded) => {
    handleActionComplete(message, amountAdded, "personalIncome");
  };

  const actions = [
    {
      icon: <Wallet size={20} />,
      label: "Hạn mức",
      onClick: () => {
        setOpen(false);
        setShowSpendingLimitModal(true);
      },
    },
    {
      icon: <RotateCcw size={20} />,
      label: "Trả nợ",
      onClick: () => {
        setOpen(false);
        setShowDebtModal(true);
      },
    },
    {
      icon: <Send size={20} />,
      label: "Nạp tiền",
      onClick: () => {
        setOpen(false);
        setShowIncomeModal(true);
      },
    },
    {
      icon: <NotebookPen size={20} />,
      label: "Ghi chép",
      onClick: () => {
        setOpen(false);
        setShowRecordModal(true);
      },
    },
  ];

  return (
    <>
      {showSpendingLimitModal && (
        <SpendingLimitModal
          userId={userId}
          onClose={() => setShowSpendingLimitModal(false)}
          // Thêm onSuccess (hoặc một prop callback khác) nếu cần trigger cập nhật sau khi lưu
          // Ví dụ: onSuccess={handleSpendingLimitSave} hoặc một hàm riêng từ DashboardNavbar
        />
      )}

      {showRecordModal && (
        <RecordModal
          onClose={() => setShowRecordModal(false)}
          // RecordModal sẽ gọi onTransactionRecorded(message, personalBalanceDelta, transactionType)
          onTransactionRecorded={handleActionComplete}
          currentGroupId={groupId} // Truyền groupId để RecordModal biết ngữ cảnh nhóm (nếu có)
        />
      )}

      {showIncomeModal && (
        <IncomeModal
          groupId={groupId} // Truyền groupId cho IncomeModal
          onClose={() => setShowIncomeModal(false)}
          onSuccess={onSuccess}
          onIncomeSuccess={handleIncomeModalSuccess}
        />
      )}

      {showDebtModal && (
        <DebtModal
          userId={userId}
          onClose={() => setShowDebtModal(false)}
          // Thêm callback nếu DebtModal cần trigger cập nhật
          // Ví dụ: onDebtPaid={() => onSuccess && onSuccess()}
        />
      )}

      {/* Điều kiện hiển thị nút nổi đã được sửa để ẩn khi BẤT KỲ modal nào đang mở */}
      {!showIncomeModal &&
        !showRecordModal &&
        !showDebtModal &&
        !showSpendingLimitModal && (
          <div className="fixed bottom-6 right-6 flex flex-col items-center gap-2 z-50">
            <div
              className={`flex flex-col items-center gap-2 transition-all duration-300 ${
                open ? "opacity-100 scale-100" : "opacity-0 scale-0"
              } origin-bottom`}
            >
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setOpen(false); // Đóng menu chính khi chọn một action
                    action.onClick(); // Gọi hàm onClick đã được định nghĩa (đã bao gồm setOpen(false))
                  }}
                  className="bg-white text-purple-500 rounded-xl shadow-md px-3 py-2 w-24 flex flex-col items-center text-xs font-medium hover:bg-purple-100 hover:text-purple-700 transition-all duration-200"
                >
                  {action.icon}
                  <span className="mt-1">{action.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setOpen(!open)}
              className="bg-purple-500 text-white text-3xl w-14 h-14 rounded-full shadow-lg hover:bg-purple-600 flex items-center justify-center transition-all"
            >
              <Plus
                size={28}
                className={`${
                  open ? "rotate-45" : "rotate-0"
                } transition-transform duration-300`}
              />
            </button>
          </div>
        )}
    </>
  );
};

export default FloatingButton;
