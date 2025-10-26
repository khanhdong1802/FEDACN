import React, { useState } from "react";
import { Wallet, Plus, RotateCcw, Send, NotebookPen } from "lucide-react";
import RecordModal from "./RecordModal";
import IncomeModal from "./IncomeModal";
import DebtModal from "./DebtModal";
import SpendingLimitModal from "./SpendingLimitModal";

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

  const handleActionComplete = (message, amountDelta, transactionType) => {
    if (onSuccess) onSuccess();
    if (transactionType === "personalIncome" && onIncomeSuccess) {
      onIncomeSuccess(message, amountDelta, transactionType);
    } else if (transactionType && onNewRecord) {
      onNewRecord(message, amountDelta, transactionType);
    }
  };

  const handleIncomeModalSuccess = (message, amountAdded) => {
    handleActionComplete(message, amountAdded, "personalIncome");
  };

  const handleRecordModalRecorded = (
    message,
    amountDelta,
    transactionTypeFromModal
  ) => {
    handleActionComplete(message, amountDelta, transactionTypeFromModal);
  };

  const actions = [
    {
      icon: <Wallet size={20} className="text-white" />,
      label: "Trả Nợ",
      bgGradient: "from-rose-500 to-pink-500",
      onClick: () => {
        setOpen(false);
        setShowDebtModal(true);
      },
    },
    {
      icon: <Send size={20} className="text-white" />,
      label: "Thu nhập",
      bgGradient: "from-emerald-500 to-teal-500",
      onClick: () => {
        setOpen(false);
        setShowIncomeModal(true);
      },
    },
    {
      icon: <RotateCcw size={20} className="text-white" />,
      label: "Hạn mức chi tiêu",
      bgGradient: "from-violet-500 to-purple-500",
      onClick: () => {
        setOpen(false);
        setShowSpendingLimitModal(true);
      },
    },
    {
      icon: <NotebookPen size={20} className="text-white" />,
      label: "Ghi chép",
      bgGradient: "from-purple-400 to-indigo-600",
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
        />
      )}

      {showRecordModal && (
        <RecordModal
          onClose={() => setShowRecordModal(false)}
          onTransactionRecorded={handleRecordModalRecorded}
        />
      )}

      {showIncomeModal && (
        <IncomeModal
          groupId={groupId}
          onClose={() => setShowIncomeModal(false)}
          onSuccess={onSuccess}
          onIncomeSuccess={handleIncomeModalSuccess}
        />
      )}

      {showDebtModal && (
        <DebtModal userId={userId} onClose={() => setShowDebtModal(false)} />
      )}

      {!showIncomeModal &&
        !showRecordModal &&
        !showDebtModal &&
        !showSpendingLimitModal && (
          <div className="fixed bottom-6 right-6 z-50">
            <div
              className={`absolute bottom-20 right-0 flex flex-col items-end space-y-3 transition-all duration-300 ${
                open
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6 pointer-events-none"
              }`}
            >
              {actions.map((action, idx) => (
                <div
                  key={action.label}
                  className="flex items-center gap-3 animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <span className="glass-card px-4 py-2 rounded-full text-sm font-medium text-foreground whitespace-nowrap shadow-elevation">
                    {action.label}
                  </span>

                  <button
                    onClick={() => {
                      action.onClick();
                    }}
                    aria-label={action.label}
                    className={`bg-gradient-to-br ${action.bgGradient} w-14 h-14 rounded-2xl shadow-glow flex items-center justify-center hover:scale-110 transition-all active:scale-95`}
                  >
                    {action.icon}
                  </button>
                </div>
              ))}
            </div>

            {/* main FAB */}
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className={`bg-gradient-to-br from-purple-500 to-indigo-600 text-white w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center`}
                aria-label="Thêm"
              >
                <Plus
                  size={22}
                  className={`${
                    open ? "rotate-45" : "rotate-0"
                  } transition-transform duration-300`}
                />
              </button>
            </div>
          </div>
        )}
    </>
  );
};

export default FloatingButton;
