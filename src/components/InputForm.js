import React, { useState } from "react";

const InputForm = ({ onCalculate }) => {
    const [dilutions, setDilutions] = useState("1e-1, 1e-2, 1e-3");
    const [positiveCounts, setPositiveCounts] = useState("8, 5, 1");
    const [totalWells, setTotalWells] = useState("8");

    const handleSubmit = (e) => {
        e.preventDefault();
        onCalculate({
            dilution_factors: dilutions.split(",").map(Number),
            positive_counts: positiveCounts.split(",").map(Number),
            total_wells: Number(totalWells),
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>TCID₅₀ 계산기</h3>
            <label>희석 단계 (예: 1e-1, 1e-2, 1e-3):</label>
            <input value={dilutions} onChange={(e) => setDilutions(e.target.value)} />
            
            <label>양성 개수 (예: 8, 5, 1):</label>
            <input value={positiveCounts} onChange={(e) => setPositiveCounts(e.target.value)} />
            
            <label>총 well 수:</label>
            <input type="number" value={totalWells} onChange={(e) => setTotalWells(e.target.value)} />

            <button type="submit">계산</button>
        </form>
    );
};

export default InputForm;
