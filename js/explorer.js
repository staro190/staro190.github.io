// ✅ tree.js에서 initializeTree 함수를 직접 가져옵니다.
import { initializeTree } from './tree.js';

console.log("✅ explorer.js 파일이 성공적으로 로드되었습니다!");

async function loadExplorer() {
    const placeholder = document.getElementById('explorer-placeholder');
    if (!placeholder) return;

    try {
        const response = await fetch('../page/explorer.html');
        const explorerHTML = await response.text();
        placeholder.innerHTML = explorerHTML;
        console.log("✅ Explorer HTML이 성공적으로 주입되었습니다.");

        // ✅ HTML이 준비된 후, tree.js의 함수를 직접 호출하여 트리를 생성합니다.
        await initializeTree();

    } catch (error) {
        console.error('Explorer를 불러오는 데 실패했습니다:', error);
    }
}
// 기존 initializeExplorer 함수를 아래와 같이 수정합니다.
export async function initializeExplorer(options = {}) {
    await loadExplorer();
    setupExplorerToggle();
    highlightCurrentPageLink();
    
    if (options.onLinkClick) {
        setupExplorerLinkEvents(options.onLinkClick);
    }
    
    expandPathToActiveLink();
}
function setupExplorerLinkEvents(linkClickHandler) {
    const links = document.querySelectorAll('#planet-list a');
    links.forEach((link, index) => {
        if (linkClickHandler) {
            link.addEventListener('click', (e) => {
                linkClickHandler(e, index);
            });
        }
    });
}

/**
 * 익스플로러 패널의 토글 버튼 기능 설정
 */
function setupExplorerToggle() {
    // 'explorer-panel' ID를 가진 요소를 찾습니다.
    const panel = document.getElementById('explorer-panel');
    // 'explorer-toggle' ID를 가진 요소를 찾습니다.
    const toggleButton = document.getElementById('explorer-toggle');

    // 두 요소 중 하나라도 없으면 함수를 중단합니다.
    if (!panel || !toggleButton) {
        console.error("오류: 토글 버튼이나 패널 요소를 찾을 수 없습니다!");
        return;
    }

    // 버튼을 클릭하면 패널과 버튼 모두에 'collapsed' 클래스를 추가하거나 제거합니다.
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
    
    // 기존: window.location.pathname;
    // 변경: 경로와 쿼리 스트링을 모두 포함합니다.
    const currentPageFull = window.location.pathname + window.location.search;

    links.forEach(link => {
        try {
            // 링크의 전체 주소에서 URL 객체를 생성합니다.
            const linkUrl = new URL(link.href, window.location.origin);
            
            // 기존: linkUrl.pathname;
            // 변경: 경로와 쿼리 스트링을 모두 포함합니다.
            const linkFull = linkUrl.pathname + linkUrl.search;

            // 이제 두 개의 전체 URL을 비교합니다.
            if (linkFull === currentPageFull) {
                link.classList.add('active');
            }
        } catch (error) {
            console.error('Invalid link URL found in explorer:', link.href, error);
        }
    });
}
/**
 * 현재 활성화된(.active) 링크가 있는 모든 상위 카테고리를 펼칩니다.
 */
function expandPathToActiveLink() {
    // 1. 현재 활성화된 링크 요소를 찾습니다.
    const activeLink = document.querySelector('#planet-list a.active');

    // 활성화된 링크가 없으면 아무것도 하지 않습니다.
    if (!activeLink) {
        return;
    }

    // 2. 활성화된 링크부터 시작해서 상위로 거슬러 올라갈 변수를 선언합니다.
    let currentElement = activeLink.parentElement; // li에서 시작

    // 3. 최상위(#planet-list)에 도달할 때까지 반복합니다.
    while (currentElement && currentElement.id !== 'planet-list') {
        // 4. 현재 요소가 카테고리 역할을 하는 li 태그라면(내부에 ul을 가짐)
        // 'collapsed' 클래스를 제거하여 펼쳐진 상태로 만듭니다.
        if (currentElement.tagName === 'LI' && currentElement.querySelector('ul')) {
            currentElement.classList.remove('collapsed');
        }

        // 5. 한 단계 더 부모 요소로 올라갑니다.
        currentElement = currentElement.parentElement;
    }
    console.log("✅ 현재 경로의 모든 카테고리를 펼쳤습니다.");
}