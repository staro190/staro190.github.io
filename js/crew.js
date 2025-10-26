import { initializeBackground } from "/js/common.js";
import { initializeExplorer } from "./explorer.js";

async function loadCrewData() {
    try {
        const response = await fetch('/data/crews.json'); // 'crew.json' 파일 요청
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const crewMembers = await response.json(); // JSON 데이터 파싱

        // 데이터 로드 성공 시 카드 생성 함수 호출
        createCrewCards(crewMembers);

    } catch (error) {
        console.error("크루 데이터를 불러오는 데 실패했습니다:", error);
        // 에러 발생 시 사용자에게 알림
        const crewContainer = document.getElementById('crew-container');
        if (crewContainer) {
            crewContainer.innerHTML = "<p style='color: #ff6b6b; text-align: center;'>[시스템 오류] 크루 데이터를 불러오는 데 실패했습니다.</p>";
        }
    }
}

// 4. 크루 카드를 생성하는 함수 (신규 - 기존 로직 분리)
function createCrewCards(crewMembers) {
    const crewContainer = document.getElementById('crew-container');
    if (!crewContainer) return; // 컨테이너 없으면 종료

    crewContainer.innerHTML = ''; // 기존 카드 내용 비우기

    crewMembers.forEach(member => {
        const cardLink = document.createElement('a');
        cardLink.classList.add('crew-member-card');
        cardLink.href = member.link;
        cardLink.target = "_blank";
        cardLink.rel = "noopener noreferrer";

        // 카드 HTML 구조
        cardLink.innerHTML = `
            <img src="${member.image}" alt="${member.name} 프로필">
            <div class="crew-info">
                <h2>${member.name}</h2>
                <span class="role">${member.role}</span>
                <p class="description">${member.description}</p>
            </div>
        `;
        crewContainer.appendChild(cardLink);
    });
}

// 2. DOM 로드 완료 시 스크립트 실행
document.addEventListener('DOMContentLoaded', () => {


    initializeExplorer();

    // 2.1. 크루 데이터를 불러오고 카드를 생성
    loadCrewData();

    // 2.2. 배경 별 애니메이션 시작
    initializeBackground();
});