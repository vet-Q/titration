import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

// Chart.js에서 필요한 요소 등록
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ChartView = ({ data }) => {
    if (!data) return null;

    const chartData = {
        labels: data.dilution_factors.map(f => `10^${Math.log10(f)}`),
        datasets: [
            {
                label: "양성 반응 수",
                data: data.positive_counts,
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(75,192,192,0.2)",
                fill: true,
                tension: 0.3,
                pointRadius: 6
            }
        ]
    };

    // Chart 옵션 (폰트, 그리드, 레전드 등)
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    font: { size: 14 }
                }
            },
            title: {
                display: true,
                text: "TCID₅₀ 그래프",
                font: { size: 18 }
            }
        },
        scales: {
            x: {
                title: { display: true, text: "희석 단계", font: { size: 16 } },
                grid: { display: false }
            },
            y: {
                title: { display: true, text: "양성 반응 수", font: { size: 16 } },
                beginAtZero: true
            }
        }
    };

    const containerStyle = {
        width: "100%",
        height: "400px",
        marginTop: "40px"
    };

    return (
        <div style={containerStyle}>
            <Line data={chartData} options={chartOptions} />
        </div>
    );
};

export default ChartView;
