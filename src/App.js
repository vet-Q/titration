import React, { useState } from "react";
import ResultDisplay from "./components/ResultDisplay";
import ChartView from "./components/ChartView";
import WellPlate from "./components/WellPlate";
import { fetchTCID50 } from "./api";
import "./styles/App.css";  // ✅ 스타일 파일 추가

const dilutionFactors = ["10^-1", "10^-2", "10^-3", "10^-4", "10^-5", "10^-6", "10^-7", "10^-8"];

const App = () => {
    const [result, setResult] = useState(null);
    const [inputData, setInputData] = useState(null);
    const [positiveCounts, setPositiveCounts] = useState(Array(8).fill(0));

    const handleUpdatePositiveCounts = (newCounts) => {
        setPositiveCounts([...newCounts]); // ✅ 새로운 배열로 설정 (불필요한 중복 업데이트 방지)
    };

    const handleCalculate = async () => {
        const requestData = {
            dilution_factors: dilutionFactors.map(f => Math.pow(10, parseFloat(f.replace("10^-", "-")))),
            positive_counts: positiveCounts,
            total_wells: 8,
        };

        setInputData(requestData);
        const response = await fetchTCID50(requestData);
        setResult(response);
    };

    return (
        <div className="app-container">
            <h1 className="title">🧪 TCID₅₀ 계산기</h1>

            <div className="section">
                <WellPlate onUpdate={handleUpdatePositiveCounts} />
            </div>

            <div className="section">
                <button className="calculate-button" onClick={handleCalculate}>
                    📊 TCID₅₀ 계산
                </button>
            </div>

            <div className="section row-layout">
                <div className="result-container">
                    <ResultDisplay result={result} />
                </div>
                <div className="chart-container">
                    <ChartView data={inputData} />
                </div>
            </div>
        </div>
    );
};

export default App;
