import React, { useState } from "react";
import "../styles/WellPlate.css";

const dilutionFactors = ["10^-1", "10^-2", "10^-3", "10^-4", "10^-5", "10^-6", "10^-7", "10^-8"];

const WellPlate = ({ onUpdate }) => {
    const [positiveCounts, setPositiveCounts] = useState(Array(8).fill(0));
    const [wells, setWells] = useState(Array(8).fill(null).map(() => Array(8).fill(false)));

    const handleClick = (row, col) => {
        setWells(prevWells => {
            const newWells = prevWells.map(innerRow => [...innerRow]);
            newWells[row][col] = !newWells[row][col];
            return newWells;
        });

        setPositiveCounts(prevCounts => {
            const newCounts = [...prevCounts];
            newCounts[row] = wells[row][col] ? prevCounts[row] - 1 : prevCounts[row] + 1;
            onUpdate(newCounts);
            return newCounts;
        });
    };

    return (
        <div className="well-plate">
            {dilutionFactors.map((factor, rowIdx) => (
                <div key={factor} className="dilution-row">
                    <span className="dilution-label">{factor}</span>
                    <div className="well-container">
                        {Array(8).fill(null).map((_, colIdx) => (
                            <div
                                key={`${rowIdx}-${colIdx}`}
                                className={`well ${wells[rowIdx][colIdx] ? "positive" : ""}`}
                                onClick={() => handleClick(rowIdx, colIdx)}
                            />
                        ))}
                    </div>
                    <span className="positive-count">{positiveCounts[rowIdx]}</span>
                </div>
            ))}
        </div>
    );
};

export default WellPlate;
