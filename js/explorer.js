/**
 * @file explorer.js
 * @description 공유 탐색 패널(explorer)의 UI를 로드하고 모든 관련 기능을 설정합니다.
 * 기능: HTML 삽입, 토글 버튼, 현재 페이지 링크 하이라이트, 행성 링크 클릭 이벤트 연결.
 */
console.log("✅ explorer.js 파일이 성공적으로 로드되었습니다!");

/**
 * explorer.html 파일을 비동기적으로 불러와 '#explorer-placeholder' 요소에 삽입합니다.
 * @returns {Promise<void>}
 */
async function loadExplorer() {
    const placeholder = document.getElementById('explorer-placeholder');
    if (!placeholder) return;

    try {
        // explorer.html의 경로는 이를 사용하는 HTML 파일을 기준으로 합니다.
        const response = await fetch('../page/explorer.html');
        const explorerHTML = await response.text();
        placeholder.innerHTML = explorerHTML;
        console.log("✅ Explorer HTML이 성공적으로 주입되었습니다.");

        // tree.js 스크립트를 동적으로 추가하여 실행시킵니다.
        const treeScript = document.createElement('script');
        treeScript.src = '../js/tree.js'; // 경로에 주의하세요.
        treeScript.defer = true;
        document.body.appendChild(treeScript);
    } catch (error) {
        console.error('Explorer를 불러오는 데 실패했습니다:', error);
    }
}

/**
 * 익스플로러 패널의 토글 버튼에 이벤트 리스너를 추가합니다.
 */
function setupExplorerToggle() {
    const panel = document.getElementById('explorer-panel');
    const toggleButton = document.getElementById('explorer-toggle');
    if (!panel || !toggleButton) return;

    toggleButton.addEventListener('click', () => {
        panel.classList.toggle('collapsed');
        toggleButton.classList.toggle('collapsed');
    });
}

/**
 * 현재 페이지 URL과 일치하는 익스플로러 링크에 'active' 클래스를 추가합니다.
 */
function highlightCurrentPageLink() {
    const links = document.querySelectorAll('#planet-list a');
    const currentPagePath = window.location.pathname;

    links.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        // 'index.html'로 끝나는 경로와 '/'로 끝나는 경로를 동일하게 취급합니다.
        if (linkPath === currentPagePath || (currentPagePath.endsWith('/') && linkPath.endsWith('index.html'))) {
            link.classList.add('active');
        }
    });
}

/**
 * 익스플로러 내 행성 링크들에 클릭 이벤트를 설정합니다.
 * voyage.html과 같은 특정 페이지에서만 링크 클릭 시 페이지 이동을 막고 콜백 함수를 실행합니다.
 * @param {function(Event, number): void} [linkClickHandler] - 링크를 클릭했을 때 실행할 콜백 함수. 이벤트 객체와 링크의 인덱스를 인자로 받습니다.
 */
function setupExplorerLinkEvents(linkClickHandler) {
    const links = document.querySelectorAll('#planet-list a');
    links.forEach((link, index) => {
        // 콜백 함수가 제공된 경우에만 특별한 클릭 이벤트를 추가합니다.
        if (linkClickHandler) {
            link.addEventListener('click', (e) => {
                linkClickHandler(e, index);
            });
        }
    });
}

/**
 * 익스플로러의 모든 기능을 초기화하는 메인 함수입니다.
 * 이 함수를 다른 JS 파일에서 import하여 사용합니다.
 * @param {object} options - 초기화 옵션 객체
 * @param {function(Event, number): void} [options.onLinkClick] - 행성 링크 클릭 시 실행될 콜백 함수
 */
export async function initializeExplorer(options = {}) {
    await loadExplorer();
    setupExplorerToggle();
    highlightCurrentPageLink();

    // 콜백 함수가 제공된 경우에만 링크 이벤트 설정을 호출합니다.
    if (options.onLinkClick) {
        setupExplorerLinkEvents(options.onLinkClick);
    }
}