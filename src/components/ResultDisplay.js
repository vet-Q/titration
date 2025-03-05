import React from "react";

const ResultDisplay = ({ result }) => {
    if (!result) return <p></p>;

    // ✅ `result.tcid50` 값이 숫자인지 확인 후 변환
    const formatTCID50 = (value) => {
        if (!value || value <= 0) return "N/A";  // 예외 처리
        const exponent = Math.floor(Math.log10(value));
        const coefficient = (value / Math.pow(10, exponent)).toFixed(2);
        return `${coefficient} × 10^${exponent}`;
    };

    return (
        <div>
            <h2>📊 TCID₅₀ 결과</h2>
            <p><strong>logID₅₀:</strong> {result.log_tcid50}</p>
            <p><strong>TCID₅₀:</strong> {formatTCID50(result.tcid50)}</p>
        </div>
    );
};

export default ResultDisplay;
