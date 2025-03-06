import React, { useState } from "react";
import ResultDisplay from "./components/ResultDisplay";
import ChartView from "./components/ChartView";
import WellPlate from "./components/WellPlate";
import { fetchTCID50 } from "./api";
import "./styles/App.css";

const dilutionFactors = ["10^-1", "10^-2", "10^-3", "10^-4", "10^-5", "10^-6", "10^-7", "10^-8"];

const App = () => {
    const [result, setResult] = useState(null);
    const [inputData, setInputData] = useState(null);
    const [positiveCounts, setPositiveCounts] = useState(Array(8).fill(0));
    const [virusVolume, setVirusVolume] = useState(50); // well 당 기존 바이러스 부피 (μL)
    const [titerVirusVolume, setTiterVirusVolume] = useState(50); // titer 측정 시 사용할 바이러스 부피 (μL)
    const [totalVolumeML, setTotalVolumeML] = useState(5); // 전체 볼륨 (mL)

    const handleUpdatePositiveCounts = (newCounts) => {
        setPositiveCounts([...newCounts]);
    };

    const handleCalculate = async () => {
        const requestData = {
            dilution_factors: dilutionFactors.map(f => Math.pow(10, parseFloat(f.replace("10^-", "-")))),
            positive_counts: positiveCounts,
            total_wells: 8,
            virus_volume_per_well: virusVolume, // 기존 측정용 바이러스 부피
            titer_virus_volume_per_well: titerVirusVolume, // 새로 추가된 titer용 바이러스 부피
            total_volume_ml: totalVolumeML,
        };

        setInputData(requestData);
        const response = await fetchTCID50(requestData);
        setResult(response);
    };

    return (
        <div className="app-container">
            <h1 className="title">🧪 TCID₅₀ 계산기</h1>

            {/* 기존 well 당 바이러스 부피 입력 */}
            <div className="section">
                <label>Virus titration시 virus volume(μL): </label>
                <input
                    type="number"
                    value={virusVolume}
                    onChange={(e) => setVirusVolume(parseFloat(e.target.value) || 0)}
                />
            </div>

            {/* titer 측정용 바이러스 부피 입력 추가 */}
            <div className="section">
                <label>BT, VNT시 100TCID/well의 virus volume (μL):  </label>
                <input
                    type="number"
                    value={titerVirusVolume}
                    onChange={(e) => setTiterVirusVolume(parseFloat(e.target.value) || 0)}
                />
            </div>

            {/* 전체 볼륨 입력 */}
            <div className="section">
                <label>전체 볼륨 (mL): </label>
                <input
                    type="number"
                    value={totalVolumeML}
                    onChange={(e) => setTotalVolumeML(parseFloat(e.target.value) || 0)}
                />
            </div>

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
                    <ResultDisplay 
                        result={result} 
                        virusVolume={virusVolume} 
                        titerVirusVolume={titerVirusVolume} 
                        totalVolumeML={totalVolumeML} 
                    />
                </div>
                <div className="chart-container">
                    <ChartView data={inputData} />
                </div>
            </div>
        </div>
    );
};

export default App;
