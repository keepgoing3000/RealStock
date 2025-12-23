/* ============================================================
   [Front-End Logic]
   1. Chart: Node.js 서버에서 실시간 주가 받아오기 (DOM 제어)
   2. Login: MySQL 서버와 연동하여 사용자 방문 기록 (MySQL 연동)
   3. Wish: MongoDB 서버에 관심 종목 저장 (MongoDB 연동)
   ============================================================ */

/* -----------------------------------------------------------
   1. 실시간 주식 차트 (DOM & 비동기 통신)
   ----------------------------------------------------------- */
async function fetchMarketData() {
    try {
        // 1. Node.js 서버에 데이터 요청
        const response = await fetch('http://localhost:3000/api/market');
        
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다');
        }

        const data = await response.json();

        // 2. DOM 요소 선택
        const kospiText = document.getElementById('kospi-text');
        const kospiBar = document.getElementById('kospi-bar');
        const kosdaqText = document.getElementById('kosdaq-text');
        const kosdaqBar = document.getElementById('kosdaq-bar');

        // 3. 텍스트 변경
        kospiText.innerText = data.kospi;
        kosdaqText.innerText = data.kosdaq;

        // 4. 차트 높이 변경 (시각화 알고리즘 수정)
        // KOSPI (3000 ~ 4000 기준)
        const kospiPercent = Math.max(0, Math.min(100, ((data.kospi - 3000) / 1000) * 100)); 
        kospiBar.style.height = `${kospiPercent}%`;

        // KOSDAQ (800 ~ 1300 기준)
        const kosdaqPercent = Math.max(0, Math.min(100, ((data.kosdaq - 800) / 500) * 100));
        kosdaqBar.style.height = `${kosdaqPercent}%`;

    } catch (error) {
        console.error('데이터 로드 실패:', error);
        // 에러 발생 시 사용자에게 알림
        const textElem = document.getElementById('kospi-text');
        if(textElem) textElem.innerText = "접속 실패";
    }
}

// 3초마다 차트 갱신
setInterval(fetchMarketData, 3000);
fetchMarketData(); // 로딩 즉시 1회 실행


/* -----------------------------------------------------------
   2. 사용자 로그인 (BOM & MySQL 연동)
   ----------------------------------------------------------- */
async function checkUserLogin() {
    // 1. 브라우저 저장소(Local Storage) 확인
    let savedName = localStorage.getItem('username');
    const greetingElement = document.getElementById('user-greeting');

    // 2. 이름이 없으면 입력 받기 (BOM: prompt)
    if (!savedName) {
        savedName = window.prompt("환영합니다! 사용자 이름을 입력해주세요.", "MinSub");
        
        if (savedName) {
            localStorage.setItem('username', savedName);
        } else {
            savedName = "Guest"; // 취소하면 게스트로 설정
        }
    }

    // 3. 화면에 이름 표시
    if (greetingElement) {
        greetingElement.innerText = `Login User: ${savedName}`;
        greetingElement.style.color = 'blue';
    }

    // 4. [핵심] MySQL 서버에 로그인 정보 전송 (방문 횟수 카운트)
    if (savedName !== "Guest") {
        try {
            await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: savedName })
            });
            console.log(`[MySQL] ${savedName} 로그인 기록 전송 완료`);
        } catch (error) {
            console.error('[MySQL] 서버 연결 실패:', error);
        }
    }
}

// 로그아웃 버튼 이벤트
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        const isLogout = window.confirm("로그아웃 하시겠습니까? (저장된 이름이 삭제됩니다)");
        if (isLogout) {
            localStorage.removeItem('username');
            alert("로그아웃 되었습니다.");
            location.reload(); // 새로고침 (BOM)
        }
    });
}

// 페이지 로드 시 로그인 체크 실행
checkUserLogin();


/* -----------------------------------------------------------
   3. 찜하기 버튼 (MongoDB 연동)
   ----------------------------------------------------------- */
const wishBtn = document.getElementById('wish-btn');

if (wishBtn) {
    wishBtn.addEventListener('click', async () => {
        const currentUser = localStorage.getItem('username') || 'Guest';
        const currentPrice = document.getElementById('kospi-text').innerText;
        const stockName = "KOSPI"; // 종목명 고정 (확장 가능)

        // 찜하기 요청 (POST -> /api/wish)
        try {
            const response = await fetch('http://localhost:3000/api/wish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: currentUser,
                    stockName: stockName,
                    price: parseFloat(currentPrice)
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(`❤️ ${stockName} (${currentPrice}) 찜 완료!\n(MongoDB에 저장되었습니다)`);
            } else {
                alert("찜하기 실패: 서버 오류");
            }
        } catch (error) {
            console.error('[MongoDB] 찜하기 실패:', error);
            alert("서버와 연결할 수 없습니다.");
        }
    });
}
/* script.js 맨 아래에 추가하세요 */

// 1. 필요한 녀석들 가져오기
const modal = document.getElementById('login-modal');   // 숨겨진 창
const openBtn = document.getElementById('login-open-btn'); // 여는 버튼
const closeBtn = document.getElementById('close-btn');     // 닫는 버튼(X)

// 2. '로그인 / 회원가입' 버튼 누르면 -> 창 열기
openBtn.addEventListener('click', () => {
    modal.style.display = 'flex'; // 보이게 설정
});

// 3. 'X' 버튼 누르면 -> 창 닫기
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none'; // 안 보이게 설정
});

// (보너스) 창 바깥(어두운 배경)을 클릭해도 닫히게 하기
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

const aiBtn = document.getElementById('ai-btn');

if (aiBtn) {
    aiBtn.addEventListener('click', async () => {
        const originalText = aiBtn.innerText;
        aiBtn.innerText = "🧠 AI가 분석 중...";
        
        try {
            const response = await fetch('/api/predict');
            const data = await response.json();

            alert(`[인공지능 분석 결과]\n\n학습 데이터: 최근 5일간 상승세 감지\n내일(6일차) 예상 코스피 지수: ${data.predicted_price} 포인트`);
        } catch (error) {
            console.error(error);
            alert("AI 분석 실패");
        } finally {
            aiBtn.innerText = originalText;
        }
    });
}