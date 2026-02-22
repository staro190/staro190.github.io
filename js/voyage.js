import { initializeBackground } from "./common.js";
import { initializeExplorer } from "./explorer.js";

console.log("✅ voyage.js 파일이 성공적으로 로드 및 실행되었습니다!");

document.addEventListener('DOMContentLoaded', () => {
    let planets = [];
    let selectedIndex = 0;

    // 1. 익스플로러 초기화 후, 패널 영역의 wheel 이벤트가 행성 선택 리스너로
    //    전파되지 않도록 stopPropagation을 등록한다.
    initializeExplorer().then(() => {
        const stopProp = (e) => e.stopPropagation();
        document.getElementById('explorer-panel')
            ?.addEventListener('wheel', stopProp, { passive: true });
        document.getElementById('explorer-toggle')
            ?.addEventListener('wheel', stopProp, { passive: true });
    });

    // 2. voyage.html 고유의 행성 선택 인터랙션 기능 실행
    if (document.getElementById('planet-image')) {
        initializePlanetSelector();
    }
    
    // 3. 모든 페이지 공통 배경 애니메이션 실행
    initializeBackground();
    
    /**
     * 행성 UI를 업데이트하는 함수.
     * @param {object} [options={}] - 업데이트 옵션
     * @param {boolean} [options.isInitial=false] - 처음 로드 시인지 여부
     * @param {boolean} [options.updateLinks=true] - 익스플로러 링크의 활성 상태를 업데이트할지 여부
     */
    function updatePlanetSelectionUI(options = {}) {
        // 💡 옵션 기본값 설정
        const { isInitial = false, updateLinks = true } = options;

        if (planets.length === 0) return;
        
        const selectedPlanet = planets[selectedIndex];
        
        const planetImageEl = document.getElementById('planet-image');
        const planetNameEl = document.getElementById('selected-planet-name');
        const warpButton = document.getElementById('warp-button');

        if (!planetImageEl || !planetNameEl || !warpButton) return;

        if (!isInitial) {
            planetImageEl.style.opacity = 0;
        }
        
        setTimeout(() => {
            planetImageEl.src = selectedPlanet.imgSrc;
            planetNameEl.textContent = selectedPlanet.name;
            warpButton.onclick = () => { window.location.href = selectedPlanet.link; };
            planetImageEl.style.opacity = 1;
        }, isInitial ? 0 : 300);

        // 💡 updateLinks가 true일 때만 익스플로러의 활성 링크를 업데이트
        if (updateLinks) {
            const links = document.querySelectorAll('#planet-list a');
            links.forEach((link, index) => {
                link.classList.toggle('active', index === selectedIndex);
            });
        }
    }

    /**
     * 행성 데이터를 불러오고 마우스 휠 이벤트를 설정하는 함수
     */
    function initializePlanetSelector() {
        fetch('../data/planets.json')
            .then(response => response.json())
            .then(data => {
                planets = data;
                // 💡 처음 로드 시에는 행성 UI와 익스플로러 활성 상태 모두 초기화
                updatePlanetSelectionUI({ isInitial: true, updateLinks: true });
            });

        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                selectedIndex = (selectedIndex + 1) % planets.length;
            } else {
                selectedIndex = (selectedIndex - 1 + planets.length) % planets.length;
            }
            // 💡 휠 스크롤 시에는 행성 UI만 업데이트하고, 익스플로러 링크는 업데이트하지 않음
            updatePlanetSelectionUI({ updateLinks: false });
        }, { passive: false });
    }
});