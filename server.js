// 파일명: server.js
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors()); // 브라우저에서 요청이 와도 막지 않도록 허용

// 주식 정보 API (Endpoint)
app.get('/api/market', (req, res) => {
    // 랜덤 주가 생성 로직
    const kospi = 2500 + Math.random() * 50 - 25; 
    const kosdaq = 850 + Math.random() * 20 - 10; 

    console.log(`[Server] 데이터 전송함: KOSPI ${kospi.toFixed(2)}, KOSDAQ ${kosdaq.toFixed(2)}`);

    res.json({
        kospi: kospi.toFixed(2),
        kosdaq: kosdaq.toFixed(2)
    });
});

// 3000번 포트에서 서버 시작
app.listen(3000, () => {
    console.log('Server running on port 3000');
});