
async function fetchMarketData() {
    try {

        const response = await fetch('http://localhost:3000/api/market');
        
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다');
        }

        const data = await response.json();


        const kospiText = document.getElementById('kospi-text');
        const kospiBar = document.getElementById('kospi-bar');
        const kosdaqText = document.getElementById('kosdaq-text');
        const kosdaqBar = document.getElementById('kosdaq-bar');


        kospiText.innerText = data.kospi;
        kosdaqText.innerText = data.kosdaq;

        const kospiPercent = Math.max(0, Math.min(100, ((data.kospi - 3000) / 1000) * 100)); 
        kospiBar.style.height = `${kospiPercent}%`;

        const kosdaqPercent = Math.max(0, Math.min(100, ((data.kosdaq - 800) / 500) * 100));
        kosdaqBar.style.height = `${kosdaqPercent}%`;

    } catch (error) {
        console.error('데이터 로드 실패:', error);
        const textElem = document.getElementById('kospi-text');
        if(textElem) textElem.innerText = "접속 실패";
    }
}


setInterval(fetchMarketData, 3000);
fetchMarketData(); 



async function checkUserLogin() {
    let savedName = localStorage.getItem('username');
    const greetingElement = document.getElementById('user-greeting');

    if (!savedName) {
        savedName = window.prompt("환영합니다! 사용자 이름을 입력해주세요.", "MinSub");
        
        if (savedName) {
            localStorage.setItem('username', savedName);
        } else {
            savedName = "Guest"; 
        }
    }


    if (greetingElement) {
        greetingElement.innerText = `Login User: ${savedName}`;
        greetingElement.style.color = 'blue';
    }

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


const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        const isLogout = window.confirm("로그아웃 하시겠습니까? (저장된 이름이 삭제됩니다)");
        if (isLogout) {
            localStorage.removeItem('username');
            alert("로그아웃 되었습니다.");
            location.reload(); 
        }
    });
}

checkUserLogin();



const wishBtn = document.getElementById('wish-btn');

if (wishBtn) {
    wishBtn.addEventListener('click', async () => {
        const currentUser = localStorage.getItem('username') || 'Guest';
        const currentPrice = document.getElementById('kospi-text').innerText;
        const stockName = "KOSPI"; 

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

const modal = document.getElementById('login-modal');  
const openBtn = document.getElementById('login-open-btn'); 
const closeBtn = document.getElementById('close-btn');    

openBtn.addEventListener('click', () => {
    modal.style.display = 'flex'; 
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none'; 
});

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