import React from "react";

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-slate-950">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Liên hệ</h2>
        <p className="text-slate-300 text-sm md:text-base mb-6">
          Có câu hỏi, góp ý hoặc muốn hợp tác? Hãy gửi email cho chúng tôi, đội
          ngũ sẽ phản hồi trong thời gian sớm nhất.
        </p>

        <div className="inline-flex flex-col items-center gap-3 bg-slate-900/80 border border-slate-700/70 rounded-2xl px-6 py-5">
          <p className="text-sm text-slate-200">
            Email:{" "}
            <span className="font-semibold text-emerald-300">
              chungtoibenban.com
            </span>
          </p>
          <button
            onClick={() => (window.location.href = "mailto:chungtoibenban.com")}
            className="text-xs md:text-sm px-4 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-medium
                       hover:shadow-[0_12px_30px_rgba(16,185,129,0.4)]
                       hover:translate-y-[1px] active:translate-y-[2px] transition-all"
          >
            Gửi email ngay
          </button>
        </div>
      </div>
    </section>
  );
};

export default Contact;
