// 파일명: script.js

// 비동기 통신(Ajax)으로 서버에서 데이터 가져오기
async function fetchMarketData() {
    try {
        // 1. Node.js 서버(localhost:3000)에 요청
        const response = await fetch('http://localhost:3000/api/market');
        
        // 서버가 꺼져있거나 응답이 없으면 에러 처리
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다');
        }

        const data = await response.json();

        // 2. DOM 요소 선택 (Selection)
        const kospiText = document.getElementById('kospi-text');
        const kospiBar = document.getElementById('kospi-bar');
        const kosdaqText = document.getElementById('kosdaq-text');
        const kosdaqBar = document.getElementById('kosdaq-bar');

        // 3. DOM 조작 (Manipulation) - 텍스트 변경
        kospiText.innerText = data.kospi;
        kosdaqText.innerText = data.kosdaq;

        // 4. DOM 조작 - 차트 높이 변경 (시각화)
        // KOSPI: 2000~3000 사이를 0~100%로 표현
        const kospiPercent = Math.max(0, Math.min(100, ((data.kospi - 2000) / 1000) * 100)); 
        kospiBar.style.height = `${kospiPercent}%`;

        // KOSDAQ: 500~1500 사이를 0~100%로 표현
        const kosdaqPercent = Math.max(0, Math.min(100, ((data.kosdaq - 500) / 1000) * 100));
        kosdaqBar.style.height = `${kosdaqPercent}%`;

    } catch (error) {
        console.error('데이터를 불러오는데 실패했습니다:', error);
        document.getElementById('kospi-text').innerText = "접속 실패";
    }
}

setInterval(fetchMarketData, 3000);
fetchMarketData();

function checkUserLogin() {
    // 브라우저 저장소(Local Storage)에서 사용자 이름 꺼내오기
    const savedName = localStorage.getItem('username');
    const greetingElement = document.getElementById('user-greeting');

    if (savedName) {
        greetingElement.innerText = `Login User: ${savedName}`;
        greetingElement.style.color = 'blue'; 
    } else {
        const inputName = window.prompt("환영합니다! 사용자 이름을 입력해주세요.", "MinSub");
        
        if (inputName) {
            localStorage.setItem('username', inputName);
            location.reload(); 
        } else {
            greetingElement.innerText = "Login User: Guest";
        }
    }
}
document.getElementById('logout-btn').addEventListener('click', () => {
    const isLogout = window.confirm("로그아웃 하시겠습니까? (저장된 이름이 삭제됩니다)");

    if (isLogout) {
        localStorage.removeItem('username');
        alert("로그아웃 되었습니다.");
        location.reload();
    }
});

checkUserLogin();