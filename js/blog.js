import { initializeBackground } from "/js/common.js";
import { initializeExplorer } from "./explorer.js";

// ✅ 사용할 함수들을 모두 import 합니다.
import { 
    setupPlanetSortVisualization, 
    insertionSortGenerator, 
    mergeSortGenerator, 
    heapSortGenerator, 
    selectionSortGenerator 
} from "/js/sort_visual.js";

// --- 어떤 마크다운 파일이 어떤 알고리즘 함수를 사용할지 연결하는 지도(Map) ---
const visualizationMap = {
    'insertionsort.md': insertionSortGenerator,
    'mergesort.md': mergeSortGenerator,
    // 'selectionsort.md': selectionSortGenerator, // 나중에 선택 정렬 페이지를 만들면 주석 해제
};

async function loadMarkdownPost(markdown) {
    if (!markdown) {
        // ... (오류 처리)
        return;
    }
    try {
        const response = await fetch(markdown);
        if (!response.ok) {
            throw new Error(`마크다운 파일 로드 실패: ${response.statusText}`);
        }
        
        const markdownText = await response.text();
        const postHTML = marked.parse(markdownText);
        const postContentElement = document.getElementById('post-content');
        
        // 1. marked로 변환된 HTML을 페이지에 먼저 삽입합니다.
        postContentElement.innerHTML = postHTML;

        // 2. ✅ 삽입된 HTML 요소 안에서 KaTeX를 실행하여 수식을 렌더링합니다.
        if (window.katex) {
            window.renderMathInElement(postContentElement, {
                // 수식을 감싸는 문자를 지정합니다.
                delimiters: [
                    {left: '$$', right: '$$', display: true},  // 블록 수식 (가운데 정렬)
                    {left: '$', right: '$', display: false}    // 인라인 수식
                ],
                throwOnError: false // 렌더링 오류가 발생해도 중단하지 않음
            });
            console.log("✅ KaTeX 수식 렌더링이 완료되었습니다!");
        }

        // ✅ 3. Prism.js 실행하여 모든 코드 블록 하이라이팅
        if (window.Prism) {
            window.Prism.highlightAll();
            console.log("✅ Prism.js 코드 하이라이팅 완료!");
        }

    } catch (error) {
        console.error(error);
        document.getElementById('post-content').innerText = '글을 불러올 수 없습니다.';
    }
}

// ... (DOMContentLoaded 등 나머지 코드는 기존과 동일)

// =======================================================================
// 3. 전체 코드 실행
// =======================================================================
// 페이지가 로드되면 마크다운을 먼저 불러온 후, 시각화 로직을 설정합니다.
document.addEventListener('DOMContentLoaded', async () => {
    
    const params = new URLSearchParams(window.location.search);
    // 2. 'markdown' 파라미터의 값을 추출합니다.
    const markdownFilePath = params.get('markdown');

    // 정규식 설명:
    // /blog/ 다음에 나오는 첫 번째 그룹(.*?)과 두 번째 그룹(.*?)을 찾습니다.
    const regex = /\/blog\/(.*?)\/(.*?)\//;

    const match = markdownFilePath.match(regex);

    let title = "";
    if (match && match.length > 2) {
        // 찾은 두 그룹(match[1], match[2])을 '-'로 연결합니다.
        title = `${match[1]}-${match[2]}`;
    }

    document.title = title;

    // 이후 로직은 동일
    await loadMarkdownPost(markdownFilePath);
    
    // --- 시각화 함수 조건부 실행 ---
    const markdownFileName = markdownFilePath.split('/').pop();
    const algorithmGenerator = visualizationMap[markdownFileName]; // 맵에서 알고리즘 함수를 찾습니다.

    if (algorithmGenerator) {
        // ✅ 찾은 알고리즘 함수를 시각화 설정 함수에 전달합니다.
        setupPlanetSortVisualization(algorithmGenerator);
    }

    
    let selectedIndex = 0;

    // 1. 익스플로러 초기화
    initializeExplorer({
        onLinkClick: (event, index) => {
            event.preventDefault();
            selectedIndex = index;
            // 💡 링크를 클릭했으므로, 행성 UI와 익스플로러 활성 상태 모두 업데이트
            updatePlanetSelectionUI({ updateLinks: true }); 
        }
    });
    
    // 4. 나머지 초기화 함수를 실행합니다.
    initializeBackground();
    console.log("✅ DOMContentLoaded 이벤트 리스너가 성공적으로 실행되었습니다!");
});