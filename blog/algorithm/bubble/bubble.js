import {initializeBackground} from "/js/common.js";
// =======================================================================
// 1. 마크다운 파일을 불러와서 HTML로 변환하고 페이지에 삽입하는 부분
// =======================================================================
async function loadMarkdownPost() {
    try {
        // 2단계에서 만든 마크다운 파일을 fetch로 불러옵니다.
        const response = await fetch('./bubble.md');
        if (!response.ok) throw new Error('마크다운 파일을 불러오는 데 실패했습니다.');
        
        const markdownText = await response.text();
        
        // Marked.js 라이브러리를 사용해 마크다운을 HTML로 변환합니다.
        const postHTML = marked.parse(markdownText);
        
        // 3단계에서 만든 main 태그 안에 변환된 HTML을 삽입합니다.
        document.getElementById('post-content').innerHTML = postHTML;

    } catch (error) {
        console.error(error);
        document.getElementById('post-content').innerText = '글을 불러올 수 없습니다.';
    }
}


// =======================================================================
// 2. 버블 정렬 시각화 로직
// =======================================================================
function setupBubbleSortVisualization() {
    const vizPlaceholder = document.getElementById('bubble-sort-visualization');
    if (!vizPlaceholder) return; // placeholder가 없으면 실행하지 않음

    // 시각화에 필요한 HTML 요소(컨테이너, 막대, 버튼)를 생성
    vizPlaceholder.innerHTML = `
        <div id="visualization-container"></div>
        <div id="controls">
            <button id="start-sort-btn">시작</button>
        </div>
    `;

    const container = document.getElementById('visualization-container');
    const startBtn = document.getElementById('start-sort-btn');
    const animationSpeed = 300; // 애니메이션 속도 (ms)
    let array = [];

    // 막대를 초기화하고 그리는 함수
    function initializeBars() {
        array = [];
        container.innerHTML = '';
        for (let i = 0; i < 15; i++) {
            array.push(Math.floor(Math.random() * 100) + 5);
        }

        array.forEach(value => {
            const bar = document.createElement('div');
            bar.classList.add('bar');
            bar.style.height = `${value * 2.5}px`;
            container.appendChild(bar);
        });
    }
    
    // 애니메이션을 위해 잠시 멈추는(sleep) 함수
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // 버블 정렬 알고리즘 (async/await로 비동기 애니메이션 구현)
    async function bubbleSort() {
        startBtn.disabled = true; // 정렬 중에는 버튼 비활성화
        const bars = document.getElementsByClassName('bar');
        
        for (let i = 0; i < array.length - 1; i++) {
            for (let j = 0; j < array.length - i - 1; j++) {
                // 비교할 막대 하이라이트
                bars[j].classList.add('bar-comparing');
                bars[j + 1].classList.add('bar-comparing');
                await sleep(animationSpeed);

                if (array[j] > array[j + 1]) {
                    // 값 스왑
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                    // 시각적 막대 높이 스왑
                    bars[j].style.height = `${array[j] * 2.5}px`;
                    bars[j + 1].style.height = `${array[j + 1] * 2.5}px`;
                    await sleep(animationSpeed);
                }

                // 하이라이트 제거
                bars[j].classList.remove('bar-comparing');
                bars[j + 1].classList.remove('bar-comparing');
            }
            // 정렬이 완료된 막대 표시
            bars[array.length - 1 - i].classList.add('bar-sorted');
        }
        bars[0].classList.add('bar-sorted'); // 마지막 남은 막대도 정렬 완료 처리
        startBtn.disabled = false; // 정렬이 끝나면 버튼 다시 활성화
    }

    // 버튼 클릭 이벤트
    startBtn.addEventListener('click', () => {
        initializeBars();
        bubbleSort();
    });

    // 초기 막대 생성
    initializeBars();
}


// =======================================================================
// 3. 전체 코드 실행
// =======================================================================
// 페이지가 로드되면 마크다운을 먼저 불러온 후, 시각화 로직을 설정합니다.
document.addEventListener('DOMContentLoaded', async () => {
    await loadMarkdownPost();
    setupBubbleSortVisualization();
    
    initializeBackground();
    console.log("✅ addEventListener 함수가 성공적으로 로드 및 실행되었습니다!");
});