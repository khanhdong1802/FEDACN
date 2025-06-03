import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Thêm Filler để dùng gradient
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Đăng ký Filler
);

const BalanceLineChart = ({ chartData }) => {
  if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Không đủ dữ liệu để vẽ biểu đồ.
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true, // Có thể ẩn nếu muốn: false
        position: "top",
      },
      title: {
        display: true,
        text: "Biến động số dư",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString() + " đ";
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Thời gian",
        },
        grid: {
          display: false, // Ẩn lưới trục X cho gọn
        },
      },
      y: {
        title: {
          display: true,
          text: "Số dư (đ)",
        },
        ticks: {
          callback: function (value) {
            if (value >= 1000000) return value / 1000000 + "M";
            if (value >= 1000) return value / 1000 + "K";
            return value;
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.4, // Làm cho đường cong mượt hơn
      },
    },
  };

  // Tạo gradient (bạn cần tham chiếu đến canvas để tạo gradient thực sự)
  // Cách đơn giản hơn là dùng màu bán trong suốt cho backgroundColor
  // Để tạo gradient như hình mẫu, cần dùng plugin hoặc callback phức tạp hơn một chút
  // Dưới đây là ví dụ với màu bán trong suốt, bạn có thể tùy chỉnh sau
  const dataWithPotentialGradient = {
    labels: chartData.labels,
    datasets: chartData.datasets.map((dataset) => ({
      ...dataset,
      // fill: true, // Đảm bảo dataset có fill: true
      // backgroundColor: 'rgba(128, 0, 128, 0.2)', // Màu tím nhạt bán trong suốt
      // borderColor: 'rgba(128, 0, 128, 1)', // Màu tím đậm
      // Hoặc bạn có thể dùng hàm để tạo gradient nếu chart instance có sẵn
    })),
  };

  return (
    <div style={{ height: "300px", width: "100%", padding: "10px 0" }}>
      {" "}
      {/* Điều chỉnh chiều cao nếu cần */}
      <Line options={options} data={dataWithPotentialGradient} />
    </div>
  );
};

export default BalanceLineChart;
