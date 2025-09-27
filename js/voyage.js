import {initializeBackground} from "./common.js";

// --- 💡 추가된 부분 1: 공유 변수 선언 ---
// 여러 함수에서 함께 사용해야 할 변수들을 DOMContentLoaded 밖으로 빼거나, 상위 스코프에 둡니다.
// 여기서는 간결함을 위해 DOMContentLoaded 내 최상단에 배치합니다.
console.log("✅ voyage.js 파일이 성공적으로 로드 및 실행되었습니다!");
document.addEventListener('DOMContentLoaded', () => {
    // --- 💡 추가된 부분: 행성 데이터와 선택 인덱스를 여러 함수가 공유할 수 있도록 이곳으로 이동 ---
    let planets = [];
    let selectedIndex = 0;
    console.log("✅ addEventListener 함수가 성공적으로 로드 및 실행되었습니다!");

    // 1. 공유 익스플로러를 불러오고, 기능(토글, 활성 링크)을 설정
    loadExplorer().then(() => {
        setupExplorerToggle();
        highlightCurrentPageLink();
        // --- 💡 추가된 부분: 탐색기 링크에 클릭 이벤트 추가 ---
        if (document.getElementById('planet-image')) {
            setupExplorerClickEvents();
        }
    });

    // 2. index.html에만 있는 행성 선택 인터랙션 기능을 실행
    if (document.getElementById('planet-image')) {
        initializePlanetSelector();
    }
    
    // 3. 배경 별 애니메이션은 모든 페이지에서 실행
    initializeBackground();

    // --- 💡 추가된 부분: 탐색기 링크 클릭 이벤트를 설정하는 함수 ---
    function setupExplorerClickEvents() {
        const links = document.querySelectorAll('#planet-list a');
        links.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                // index.html에서는 행성만 바꾸고 페이지 이동은 막음
                e.preventDefault();
                selectedIndex = index;
                // 행성 UI를 업데이트하는 함수 호출
                updatePlanetSelectionUI();
            });
        });
    }
    
    // --- 💡 추가된 부분: 행성 UI 업데이트 로직을 별도 함수로 분리 ---
    // initializePlanetSelector 내부와 외부에서 모두 호출하기 위함입니다.
    function updatePlanetSelectionUI(isInitial = false) {
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
            planetImageEl.src = selectedPlanet.imgSrc; // imgSrc 필드가 JSON에 있어야 합니다.
            planetNameEl.textContent = selectedPlanet.name;
            warpButton.onclick = () => { window.location.href = selectedPlanet.link; };
            planetImageEl.style.opacity = 1;
        }, isInitial ? 0 : 300);

        // --- 💡 추가된 부분: 탐색기 링크 하이라이트 ---
        const links = document.querySelectorAll('#planet-list a');
        links.forEach((link, index) => {
            link.classList.toggle('active', index === selectedIndex);
        });
    }

    // 행성 선택 관련 기능
    function initializePlanetSelector() {
        fetch('../data/planets.json') // 기존처럼 planets.json을 사용
            .then(response => response.json())
            .then(data => {
                planets = data; // 공유 변수에 데이터 할당
                updatePlanetSelectionUI(true); 
            });

        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                selectedIndex = (selectedIndex + 1) % planets.length;
            } else {
                selectedIndex = (selectedIndex - 1 + planets.length) % planets.length;
            }
            updatePlanetSelectionUI();
        }, { passive: false });
    }
});


// =======================================================================
// 아래 함수들은 기존 코드와 동일합니다. (변경 없음)
// =======================================================================

// 공유 익스플로러(explorer.html)를 불러와 페이지에 삽입하는 함수
async function loadExplorer() {
    const placeholder = document.getElementById('explorer-placeholder');
    if (!placeholder) return;

    try {
        const response = await fetch('../page/explorer.html');
        const explorerHTML = await response.text();
        placeholder.innerHTML = explorerHTML;
        console.log("✅ placeholder :", explorerHTML);

        const treeScript = document.createElement('script');
        
        // tree.js의 경로는 voyage.html을 기준으로 합니다.
        treeScript.src = '../js/tree.js'; 
        treeScript.defer = true; // HTML 파싱을 막지 않도록 defer 속성 추가
        
        // body의 맨 끝에 스크립트 태그를 추가하여 실행시킵니다.
        document.body.appendChild(treeScript);
        console.log("✅ tree.js :", treeScript.src);
    } catch (error) {
        console.error('Explorer를 불러오는 데 실패했습니다:', error);
    }
}

// 익스플로러 토글 버튼 기능 설정
function setupExplorerToggle() {
    const panel = document.getElementById('explorer-panel');
    const toggleButton = document.getElementById('explorer-toggle');
    if (!panel || !toggleButton) return;

    toggleButton.addEventListener('click', () => {
        panel.classList.toggle('collapsed');
        toggleButton.classList.toggle('collapsed');
    });
}

// 현재 페이지 URL을 기반으로 익스플로러의 해당 링크를 활성화
function highlightCurrentPageLink() {
    const links = document.querySelectorAll('#planet-list a');
    const currentPagePath = window.location.pathname;

    links.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPagePath || (currentPagePath.endsWith('/') && linkPath.endsWith('index.html'))) {
            link.classList.add('active');
        }
    });
}

