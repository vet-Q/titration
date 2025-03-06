import React from "react";

const ResultDisplay = ({ result, virusVolume, titerVirusVolume, totalVolumeML }) => {
    if (!result || !virusVolume || !titerVirusVolume || !totalVolumeML) return <p></p>;

    // 값이 숫자인지 확인하고 과학적 표기법으로 변환하는 함수
    const formatScientific = (value) => {
        if (!value || value <= 0) return "N/A";  // 예외 처리
        const exponent = Math.floor(Math.log10(value));
        const coefficient = (value / Math.pow(10, exponent)).toFixed(2);
        return `${coefficient} × 10^${exponent}`;
    };

    console.log(result);

    return (
        <div className="result-display">
            <h2>📊 TCID₅₀ 결과</h2>
            <p><strong>logTCID₅₀:</strong> {result.log_tcid50}</p>
            <p>
                <strong>TCID₅₀/mL:</strong> {formatScientific(result.tcid50)} / mL
            </p>
            <p>
                <strong>TCID₅₀/{virusVolume}μL:</strong> {formatScientific(result.tcid50_per_virus)} / {virusVolume}μL
            </p>

            <h3>🧪 100TCID₅₀/{titerVirusVolume}μL희석 정보</h3>
            <p><strong>총 볼륨:</strong> {totalVolumeML} mL</p>
            <p><strong>필요한 원액 (μL):</strong> {result.stock_volume_ul}</p>
            <p><strong>필요한 희석액 (μL):</strong> {result.diluent_volume_ul}</p>

            <h3>⚠️ 추가 정보</h3>
            <p>
                <strong>Virus titration시 Well당 바이러스 양:</strong> {virusVolume} μL
            </p>
            <p>
                <strong>BT,VNT 측정 시 100TCID/Well의 volume:</strong> {titerVirusVolume} μL
            </p>
        </div>
    );
};

export default ResultDisplay;
