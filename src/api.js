export const fetchTCID50 = async (data) => {
    try {
        const response = await fetch("http://localhost:8080/tcid50", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "cors", // ✅ CORS 허용
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`서버 응답 오류: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error("API 요청 실패:", error.message);
        throw new Error("서버에 연결할 수 없습니다. Go 서버가 실행 중인지 확인하세요.");
    }
};
