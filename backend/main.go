package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"

	"github.com/rs/cors"
)

type TCID50Request struct {
	// 예: DilutionFactors: [0.1, 0.01, 0.001, 0.0001, 1e-05, 1e-06, 1e-07, 1e-08]
	DilutionFactors []float64 `json:"dilution_factors"`
	// 예: PositiveCounts: [8, 6, 5, 0, 0, 0, 0, 0]
	PositiveCounts []float64 `json:"positive_counts"`
	// 각 희석 단계별 웰 수 (예: 8)
	TotalWells float64 `json:"total_wells"`
	// titer 측정 시 사용한 well 당 바이러스 부피 (µL) – TCID50 측정시 사용됨
	VirusVolumePerWell float64 `json:"virus_volume_per_well"`
	// 희석 시 100TCID50/well 달성을 위해 사용할 바이러스 부피 (µL)
	TiterVirusVolumePerWell float64 `json:"titer_virus_volume_per_well"`
	// 희석 최종 부피 (mL)
	TotalVolumeML float64 `json:"total_volume_ml"`
}

type TCID50Response struct {
	LogTCID50       float64 `json:"log_tcid50"`
	TCID50          float64 `json:"tcid50"` // TCID50/mL
	TCID50PerVirus  float64 `json:"tcid50_per_virus"`
	StockVolumeUL   float64 `json:"stock_volume_ul"`
	DiluentVolumeUL float64 `json:"diluent_volume_ul"`
}

func calculateTCID50(data TCID50Request) (TCID50Response, error) {
	n := len(data.DilutionFactors)
	if n == 0 || len(data.PositiveCounts) != n {
		return TCID50Response{}, fmt.Errorf("입력 배열 길이가 맞지 않습니다.")
	}
	if data.TotalWells <= 0 || data.VirusVolumePerWell <= 0 || data.TotalVolumeML <= 0 || data.TiterVirusVolumePerWell <= 0 {
		return TCID50Response{}, fmt.Errorf("TotalWells, VirusVolumePerWell, TiterVirusVolumePerWell, TotalVolumeML은 양수여야 합니다.")
	}

	// 1) 각 단계별 양성/음성 웰 수 계산
	positives := make([]float64, n)
	negatives := make([]float64, n)
	for i := 0; i < n; i++ {
		p := data.PositiveCounts[i]
		if p > data.TotalWells {
			return TCID50Response{}, fmt.Errorf("양성 웰 수가 전체 웰 수보다 클 수 없습니다.")
		}
		positives[i] = p
		negatives[i] = data.TotalWells - p
	}

	// 2) "사용자 표"처럼 Cumulative Pos/Neg 계산
	//    - Cumulative Positive[i] = i행부터 끝(n-1행)까지의 양성 합
	//    - Cumulative Negative[i] = 0행부터 i행까지의 음성 합
	cumulativePos := make([]float64, n)
	cumulativeNeg := make([]float64, n)

	// Cumulative Positive: i행부터 아래쪽 합산
	for i := 0; i < n; i++ {
		sumPos := 0.0
		for k := i; k < n; k++ {
			sumPos += positives[k]
		}
		cumulativePos[i] = sumPos
	}

	// Cumulative Negative: 맨 위부터 i행까지 합산
	for i := 0; i < n; i++ {
		sumNeg := 0.0
		for k := 0; k <= i; k++ {
			sumNeg += negatives[k]
		}
		cumulativeNeg[i] = sumNeg
	}

	// 3) 각 단계별 감염률 = CumulativePos / (CumulativePos + CumulativeNeg)
	infectedRates := make([]float64, n)
	for i := 0; i < n; i++ {
		denom := cumulativePos[i] + cumulativeNeg[i]
		if denom > 0 {
			infectedRates[i] = cumulativePos[i] / denom
		} else {
			infectedRates[i] = 0
		}
	}

	// 4) 50% 경계를 넘나드는 지점에서 선형 보간하여 logTCID50 결정
	idx := -1
	for i := 0; i < n-1; i++ {
		if infectedRates[i] >= 0.5 && infectedRates[i+1] < 0.5 {
			idx = i
			break
		}
	}

	var logTCID50 float64
	if idx == -1 {
		// 50%를 넘나드는 구간이 없으면, 마지막 희석배수 기준 사용
		logTCID50 = math.Log10(data.DilutionFactors[n-1])
	} else {
		p1 := infectedRates[idx]
		p2 := infectedRates[idx+1]
		d1 := math.Log10(data.DilutionFactors[idx])
		d2 := math.Log10(data.DilutionFactors[idx+1])
		fraction := (p1 - 0.5) / (p1 - p2)
		logTCID50 = d1 - fraction*(d1-d2)
	}

	// 5) TCID50 계산 (TCID50/mL)
	//    기존 titer 측정시 사용한 well 당 바이러스 부피(data.VirusVolumePerWell)를 이용하여 조정
	tcid50 := math.Pow(10, math.Abs(logTCID50)) * 1000 / data.VirusVolumePerWell

	// 6) 희석 계산
	//    titer 시 100TCID50/well 달성을 위해,
	//    새로 입력받은 data.TiterVirusVolumePerWell (µL)를 사용하여 목표 TCID50/mL 계산
	targetTCID50PerML := (100.0 / data.TiterVirusVolumePerWell) * 1000
	dilutionFactor := tcid50 / targetTCID50PerML
	stockVolumeUL := (data.TotalVolumeML * 1000) / dilutionFactor
	diluentVolumeUL := (data.TotalVolumeML * 1000) - stockVolumeUL

	// 디버그 출력
	fmt.Println("=== Debug ===")
	fmt.Println("Dilution Factors:", data.DilutionFactors)
	fmt.Println("Positives:", positives)
	fmt.Println("Negatives:", negatives)
	fmt.Println("Cumulative Pos:", cumulativePos)
	fmt.Println("Cumulative Neg:", cumulativeNeg)
	fmt.Println("Infected Rates:", infectedRates)
	fmt.Printf("Selected logTCID50 = %.4f\n", logTCID50)
	fmt.Println("==============")

	return TCID50Response{
		LogTCID50:       logTCID50,
		TCID50:          tcid50,
		TCID50PerVirus:  tcid50 / 1000.0 * data.VirusVolumePerWell,
		StockVolumeUL:   stockVolumeUL,
		DiluentVolumeUL: diluentVolumeUL,
	}, nil
}

func handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var req TCID50Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "JSON 해석 오류", http.StatusBadRequest)
		return
	}

	res, err := calculateTCID50(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/tcid50", handler)

	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: true,
	}).Handler(mux)

	log.Println("서버 실행 중... http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", corsHandler))
}
