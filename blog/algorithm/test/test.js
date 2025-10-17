import {initializeBackground} from "/js/common.js";
// =======================================================================
// 1. 마크다운 파일을 불러와서 HTML로 변환하고 페이지에 삽입하는 부분
// =======================================================================
async function loadMarkdownPost() {
    try {
        const response = await fetch('./test.md');
        if (!response.ok) throw new Error('마크다운 파일을 불러오는 데 실패했습니다.');
        
        const markdownText = await response.text();
        const postHTML = marked.parse(markdownText);
        document.getElementById('post-content').innerHTML = postHTML;

    } catch (error) {
        console.error(error);
        document.getElementById('post-content').innerText = '글을 불러올 수 없습니다.';
    }
}


// =======================================================================
// 2. 태양계 행성 정렬 시각화 로직 (고유색 + 전체 수직선 최종 버전)
// =======================================================================
function setupPlanetSortVisualization() {
    const vizPlaceholder = document.getElementById('test-sort-visualization');
    if (!vizPlaceholder) return;

    vizPlaceholder.innerHTML = `
        <div id="visualization-history">
            <svg id="trail-svg-container"></svg>
        </div>
        <div id="controls">
            <button id="start-sort-btn">정렬 시작</button>
        </div>
    `;

    const historyContainer = document.getElementById('visualization-history');
    const svgContainer = document.getElementById('trail-svg-container');
    const startBtn = document.getElementById('start-sort-btn');
    const animationSpeed = 1000;

    // 행성 데이터에 고유 색상(color) 속성 추가
    const planetsData = [
        { name: '수성', order: 0, img: '/img/planets/mercury.png', color: '#9E9E9E' }, // Gray
        { name: '금성', order: 1, img: '/img/planets/venus.png',   color: '#FFEB3B' }, // Yellow
        { name: '지구', order: 2, img: '/img/planets/earth.png',   color: '#42A5F5' }, // Blue
        { name: '화성', order: 3, img: '/img/planets/mars.png',     color: '#E57373' }, // Red
        { name: '목성', order: 4, img: '/img/planets/jupiter.png', color: '#FFB74D' }, // Orange
        { name: '토성', order: 5, img: '/img/planets/saturn.png',   color: '#FFF176' }, // Pale Gold
        { name: '천왕성', order: 6, img: '/img/planets/uranus.png', color: '#4DD0E1' }, // Cyan
        { name: '해왕성', order: 7, img: '/img/planets/neptune.png', color: '#5C6BC0' }  // Indigo
    ];

    let currentPlanetState = [];

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function createStepRow(planets, sortedUntilIndex = -1, stepIndex = 0, invisibleIndices = []) {
        const stepDiv = document.createElement('div');
        stepDiv.classList.add('sort-step');
        stepDiv.dataset.step = stepIndex;
        
        const stepLabel = document.createElement('div');
        stepLabel.classList.add('step-label');
        stepLabel.textContent = `STEP ${stepIndex}`;
        stepDiv.appendChild(stepLabel);

        planets.forEach((planet, index) => {
            const planetImg = document.createElement('img');
            planetImg.src = planet.img;
            planetImg.alt = planet.name;
            planetImg.classList.add('planet');
            planetImg.dataset.order = planet.order;
            
            if (index <= sortedUntilIndex) {
                planetImg.classList.add('planet-sorted');
                planetImg.style.boxShadow = `0 0 15px 3px ${planet.color}`;
            }
            if (invisibleIndices.includes(index)) {
                planetImg.classList.add('planet-placeholder');
            }
            stepDiv.appendChild(planetImg);
        });
        return stepDiv;
    }
    
    function initializePlanets() {
        historyContainer.querySelectorAll('.sort-step').forEach(el => el.remove());
        svgContainer.innerHTML = '';
        currentPlanetState = shuffleArray([...planetsData]);
        const initialStep = createStepRow(currentPlanetState, -1, 0);
        historyContainer.appendChild(initialStep);
    }

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function drawTrail(pathData, color, ...classNames) {
        const trail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        trail.setAttribute('d', pathData);
        trail.classList.add('planet-trail', ...classNames);
        trail.style.stroke = color;
        svgContainer.appendChild(trail);

        const length = trail.getTotalLength();
        trail.style.strokeDasharray = length;
        trail.style.strokeDashoffset = length;
        setTimeout(() => {
            trail.style.strokeDashoffset = 0;
        }, 50);
    }

    async function sortPlanets() {
        startBtn.disabled = true;
        let stepCounter = 1;

        for (let i = 0; i < currentPlanetState.length - 1; i++) {
            let minIndex = i;
            for (let j = i + 1; j < currentPlanetState.length; j++) {
                if (currentPlanetState[j].order < currentPlanetState[minIndex].order) {
                    minIndex = j;
                }
            }
            
            const prevStepDiv = historyContainer.lastChild;
            const prevPlanets = prevStepDiv.querySelectorAll('.planet'); // 이전 줄의 모든 행성 이미지 DOM
            const containerRect = historyContainer.getBoundingClientRect();

            // 현재 단계의 행성 상태 (아직 DOM에 추가되지 않음)
            const tempState = [...currentPlanetState]; // 현재 currentPlanetState 복사본
            if (minIndex !== i) { // 교체가 필요한 경우
                [tempState[i], tempState[minIndex]] = [tempState[minIndex], tempState[i]]; // 임시로 교체
            }
            
            // 다음 단계의 DOM 요소를 미리 생성 (실제 시각적 위치는 아직 확정 안됨)
            // placeholder는 교체되거나 움직일 행성 자리를 비워두는 용도
            const invisibleIndices = minIndex !== i ? [i, minIndex] : []; // 교체 대상만 placeholder로
            const nextStep = createStepRow(tempState, i, stepCounter, invisibleIndices);
            historyContainer.appendChild(nextStep);
            historyContainer.scrollTop = historyContainer.scrollHeight;
            const nextPlanets = nextStep.querySelectorAll('.planet'); // 다음 줄의 모든 행성 이미지 DOM
            
            // ==== 모든 행성의 시작/끝 좌표 및 궤적 그리기 & 애니메이션 클론 준비 ====
            const animatingClones = []; // 애니메이션할 클론들을 담을 배열
            const animatingSourcePlanets = []; // 애니메이션할 원본 행성들을 담을 배열

            for (let k = 0; k < currentPlanetState.length; k++) {
                const startPlanetDOM = prevPlanets[k];
                // minIndex !== i 일 때, k === i 에 있던 행성은 tempState[minIndex] 위치로 가야 하고
                // k === minIndex 에 있던 행성은 tempState[i] 위치로 가야 함
                // 그 외 행성은 k 위치 그대로
                let targetIndexInNextState = k;
                if (minIndex !== i) { // 교체가 일어난 경우
                    if (k === i) { // i번째 행성은 minIndex 위치로
                        targetIndexInNextState = minIndex;
                    } else if (k === minIndex) { // minIndex번째 행성은 i 위치로
                        targetIndexInNextState = i;
                    }
                }
                const endPlanetDOM = nextPlanets[targetIndexInNextState]; // k번째 행성의 최종 도착 DOM

                const startRect = startPlanetDOM.getBoundingClientRect();
                const endRect = endPlanetDOM.getBoundingClientRect();
                
                const startX = startRect.left - containerRect.left + startRect.width / 2;
                const startY = startRect.top - containerRect.top + startRect.height / 2;
                const endX = endRect.left - containerRect.left + endRect.width / 2;
                const endY = endRect.top - containerRect.top + endRect.height / 2;
                
                const planetDataForColor = currentPlanetState[k]; // k번째 행성의 데이터 (색상 가져오기 위함)
                const color = planetDataForColor.color;

                let pathData;
                let trailClass;

                // 교체 대상인 경우 (대각선), 그 외는 수직선
                if (minIndex !== i && (k === i || k === minIndex)) {
                    pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
                    trailClass = 'trail-swap';
                } else { // 교체 대상이 아니거나, 교체가 일어나지 않는 단계의 모든 행성
                    pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
                    trailClass = 'trail-straight';
                }
                drawTrail(pathData, color, trailClass);

                // 애니메이션 클론 생성 및 스타일 설정
                const clone = startPlanetDOM.cloneNode();
                clone.classList.add('planet-animating');
                clone.style.boxShadow = `0 0 20px 5px ${color}`;
                clone.style.top = `${startRect.top - containerRect.top}px`;
                clone.style.left = `${startRect.left - containerRect.left}px`;
                historyContainer.appendChild(clone);
                
                animatingClones.push(clone);
                animatingSourcePlanets.push(startPlanetDOM); // 원본 DOM을 추적
            }
            
            // 원본 행성들을 숨김 처리 (클론이 움직이는 동안)
            animatingSourcePlanets.forEach(p => p.classList.add('planet-ghost'));

            await sleep(50); // DOM 렌더링을 위한 잠시 대기

            // 모든 클론을 최종 위치로 이동시키는 애니메이션 시작
            animatingClones.forEach((clone, k) => {
                const startPlanetDOM = prevPlanets[k];
                let targetIndexInNextState = k;
                if (minIndex !== i) {
                    if (k === i) {
                        targetIndexInNextState = minIndex;
                    } else if (k === minIndex) {
                        targetIndexInNextState = i;
                    }
                }
                const endPlanetDOM = nextPlanets[targetIndexInNextState]; // k번째 행성의 최종 도착 DOM
                const endRect = endPlanetDOM.getBoundingClientRect();

                clone.style.top = `${endRect.top - containerRect.top}px`;
                clone.style.left = `${endRect.left - containerRect.left}px`;
            });
            
            await sleep(animationSpeed); // 애니메이션 시간 대기

            // 애니메이션 완료 후 정리
            animatingClones.forEach((clone, k) => {
                clone.remove(); // 클론 제거
                let targetIndexInNextState = k;
                if (minIndex !== i) {
                    if (k === i) {
                        targetIndexInNextState = minIndex;
                    } else if (k === minIndex) {
                        targetIndexInNextState = i;
                    }
                }
                // 최종 위치의 행성 placeholder 해제
                nextPlanets[targetIndexInNextState].classList.remove('planet-placeholder');
            });

            // 실제 데이터 상태 업데이트
            if (minIndex !== i) {
                [currentPlanetState[i], currentPlanetState[minIndex]] = [currentPlanetState[minIndex], currentPlanetState[i]];
            }
            
            stepCounter++;
        }
        
        // 마지막 단계 (정렬 완료된 상태로 내려오는) 궤적 및 애니메이션
        const lastStepDiv = historyContainer.lastChild;
        const lastPlanets = lastStepDiv.querySelectorAll('.planet');
        const finalStep = createStepRow(currentPlanetState, currentPlanetState.length - 1, stepCounter - 1); // final step은 마지막까지 정렬된 상태
        historyContainer.appendChild(finalStep);
        historyContainer.scrollTop = historyContainer.scrollHeight;
        const finalPlanets = finalStep.querySelectorAll('.planet');
        const containerRect = historyContainer.getBoundingClientRect();

        const finalClones = [];
        const finalSourcePlanets = [];

        for (let k = 0; k < currentPlanetState.length; k++) {
            const startPlanetDOM = lastPlanets[k];
            const endPlanetDOM = finalPlanets[k];
            if (!startPlanetDOM || !endPlanetDOM) continue; 

            const startRect = startPlanetDOM.getBoundingClientRect();
            const endRect = endPlanetDOM.getBoundingClientRect();
            
            if (startRect.width === 0 || endRect.width === 0) continue;

            const startX = startRect.left - containerRect.left + startRect.width / 2;
            const startY = startRect.top - containerRect.top + startRect.height / 2;
            const endX = endRect.left - containerRect.left + endRect.width / 2;
            const endY = endRect.top - containerRect.top + endRect.height / 2;
            
            const color = currentPlanetState[k].color;
            drawTrail(`M ${startX} ${startY} L ${endX} ${endY}`, color, 'trail-straight');

            const clone = startPlanetDOM.cloneNode();
            clone.classList.add('planet-animating');
            clone.style.boxShadow = `0 0 20px 5px ${color}`;
            clone.style.top = `${startRect.top - containerRect.top}px`;
            clone.style.left = `${startRect.left - containerRect.left}px`;
            historyContainer.appendChild(clone);

            finalClones.push(clone);
            finalSourcePlanets.push(startPlanetDOM);
        }
        
        finalSourcePlanets.forEach(p => p.classList.add('planet-ghost'));
        await sleep(50);

        finalClones.forEach((clone, k) => {
            const endPlanetDOM = finalPlanets[k];
            const endRect = endPlanetDOM.getBoundingClientRect();
            clone.style.top = `${endRect.top - containerRect.top}px`;
            clone.style.left = `${endRect.left - containerRect.left}px`;
        });

        await sleep(animationSpeed);

        finalClones.forEach((clone, k) => {
            clone.remove();
            finalPlanets[k].classList.remove('planet-placeholder');
        });

        startBtn.disabled = false;
    }

    startBtn.addEventListener('click', () => {
        initializePlanets();
        setTimeout(sortPlanets, 100);
    });

    initializePlanets();
}

// =======================================================================
// 3. 전체 코드 실행
// =======================================================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadMarkdownPost();
    setupPlanetSortVisualization(); 
    
    initializeBackground();
    console.log("✅ addEventListener 함수가 성공적으로 로드 및 실행되었습니다!");
});