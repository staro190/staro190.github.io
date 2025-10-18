import {initializeBackground} from "/js/common.js";

// =======================================================================
// 2. 태양계 행성 정렬 시각화 로직 (고유색 + 전체 수직선 최종 버전)
// =======================================================================
export function setupPlanetSortVisualization() {

    // ✅ 1. 이 두 줄을 함수의 맨 위에 추가하세요.
    const container = document.getElementById('solarsys-sort-visualization');
    console.log("sort_visual.js: 시각화 컨테이너를 찾습니다 ->", container);

    // ✅ 2. 컨테이너가 없으면 에러를 출력하고 함수를 중단시킵니다.
    if (!container) {
        console.error("sort_visual.js: 에러! #solarsys-sort-visualization 요소를 찾을 수 없습니다. insertionsort.md 파일에 해당 id를 가진 div가 있는지 확인하세요.");
        return; 
    }

    const vizPlaceholder = document.getElementById('solarsys-sort-visualization');
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

    const planetsData = [
        { name: '수성', order: 0, img: '/img/planets/mercury.png', color: '#9E9E9E' }, // Gray
        { name: '금성', order: 1, img: '/img/planets/venus.png',   color: '#FF7F00' }, // Orange
        { name: '지구', order: 2, img: '/img/planets/earth.png',   color: '#87BC49' }, // Green
        { name: '화성', order: 3, img: '/img/planets/mars.png',     color: '#E57373' }, // Red
        { name: '목성', order: 4, img: '/img/planets/jupiter.png', color: '#964B00' }, // Brown
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
    
    async function initializePlanets() {
        historyContainer.querySelectorAll('.sort-step').forEach(el => el.remove());
        svgContainer.innerHTML = '';
        currentPlanetState = shuffleArray([...planetsData]);
        const initialStep = createStepRow(currentPlanetState, -1, 0);
        historyContainer.appendChild(initialStep);

        await sleep(50);
    }

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // ✅ CSS 대신 JS로 직접 애니메이션을 구현하는 최종 코드입니다.
    function drawTrail(pathData, color, ...classNames) {
        const trail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        trail.setAttribute('d', pathData);
        trail.classList.add('planet-trail', ...classNames);
        trail.style.stroke = color;
        svgContainer.appendChild(trail);

        const length = trail.getTotalLength();
        if (length === 0) return;

        // 궤적을 점선으로 만들기 위한 설정
        trail.style.strokeDasharray = length;

        // --- JavaScript 애니메이션 로직 ---
        const animationDuration = 1000; // 애니메이션 시간 (밀리초, 0.8초)
        let startTime = null;

        // 'animate' 함수는 각 프레임을 그리는 역할을 합니다.
        function animate(currentTime) {
            if (!startTime) {
                startTime = currentTime;
            }

            // 시작부터 현재까지 흐른 시간
            const elapsedTime = currentTime - startTime;
            
            // 애니메이션 진행률 (0.0 ~ 1.0)
            const progress = Math.min(elapsedTime / animationDuration, 1);
            
            // 진행률에 따라 궤적의 시작점을 이동시킴 (length -> 0)
            const currentOffset = length * (1 - progress);
            trail.style.strokeDashoffset = currentOffset;

            // 애니메이션이 아직 끝나지 않았다면 다음 프레임을 요청
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        // 애니메이션 시작
        requestAnimationFrame(animate);
    }
        
    /**
     * @brief 두 행성 상태 간의 전환을 애니메이션으로 처리하는 함수
     * @param {Array} fromState - 시작 상태의 행성 배열
     * @param {Array} toState - 종료 상태의 행성 배열
     * @param {number} sortedUntilIndex - 정렬이 완료된 위치의 인덱스
     * @param {number} stepCounter - 현재 단계 번호
     */
    // ✅ 이 코드로 animateTransition 함수를 완전히 교체해주세요.
    async function animateTransition(fromState, toState, sortedUntilIndex, stepCounter) {
        historyContainer.appendChild(createStepRow(toState, sortedUntilIndex, stepCounter, []));
        historyContainer.scrollTop = historyContainer.scrollHeight;
        svgContainer.style.height = `${historyContainer.scrollHeight}px`;

        const allSteps = historyContainer.querySelectorAll('.sort-step');
        const prevStepDiv = allSteps[allSteps.length - 2];
        const nextStep = allSteps[allSteps.length - 1];
        
        nextStep.classList.add('step-ghost'); // ← 이 줄을 추가

        if (!prevStepDiv) {
            if (nextStep) {
                const initialPlanets = nextStep.querySelectorAll('.planet');
                initialPlanets.forEach(p => p.classList.remove('placeholder'));
            }
            return;
        }

        const prevPlanets = prevStepDiv.querySelectorAll('.planet');
        const nextPlanets = nextStep.querySelectorAll('.planet');
        
        const containerRect = historyContainer.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(historyContainer);
        const borderLeft = parseFloat(computedStyle.borderLeftWidth);
        const borderTop = parseFloat(computedStyle.borderTopWidth);

        let horizontalOffset = 0; // 기본 오차 값
        const firstStepElement = document.querySelector('.planet'); // DOM에서 .sort-step 요소를 하나 찾습니다.

        if (firstStepElement) {
            // getComputedStyle을 사용해 최종 계산된 스타일 값을 가져옵니다.
            const styles = window.getComputedStyle(firstStepElement);
            // "10px" 같은 문자열로 값을 반환하므로, 숫자만 추출합니다.
            horizontalOffset = parseFloat(styles.marginLeft); 
        }

        const movingIndices = [];
        for (let i = 0; i < fromState.length; i++) {
            if (fromState[i].order !== toState[i].order) { movingIndices.push(i); }
        }

        /*
        for (let i = 0; i < fromState.length; i++) {
            nextPlanets[i].classList.add('planet-placeholder');
        }*/

        

        const animatingClones = [];
        const animatingSourcePlanets = [];

        for (let i = 0; i < fromState.length; i++) {
            const startPlanetData = fromState[i];
            const startPlanetDOM = prevPlanets[i];
            const targetIndexInNextState = toState.findIndex(p => p.order === startPlanetData.order);
            const endPlanetDOM = nextPlanets[targetIndexInNextState];

            if (!startPlanetDOM || !endPlanetDOM) continue;

            const startRect = startPlanetDOM.getBoundingClientRect();
            const endRect = endPlanetDOM.getBoundingClientRect();
            
            if (startRect.width === 0 || endRect.width === 0) continue;

            // ★★★★★★★★★★ 바로 여기! ★★★★★★★★★★
            // 스크롤된 Y 값을 더해서 실제 위치를 계산합니다.
            const scrollTop = historyContainer.scrollTop;

            const startX = startRect.left - containerRect.left - borderLeft + startRect.width / 2;
            const startY = startRect.top - containerRect.top - borderTop + startRect.height / 2 + scrollTop;
            const endX = endRect.left - containerRect.left - borderLeft + endRect.width / 2;
            const endY = endRect.top - containerRect.top - borderTop + endRect.height / 2 + scrollTop;
            // ★★★★★★★★★★★★★★★★★★★★★★★★★

            const color = startPlanetData.color;
            const pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
            const trailClass = (movingIndices.includes(i) || toState.findIndex(p => p.order === fromState[i].order) !== i) ? 'trail-swap' : 'trail-straight';
            drawTrail(pathData, color, trailClass);
            
            const clone = startPlanetDOM.cloneNode();
            clone.classList.add('planet-animating');
            //clone.style.boxShadow = `0 0 20px 5px ${color}`;
            clone.style.top = `${startY - borderTop - startRect.height / 2}px`;
            clone.style.left = `${startX - horizontalOffset - startRect.width / 2}px`;
            historyContainer.appendChild(clone);
            
            animatingClones.push({ 
                clone, 
                endTop: endY - endRect.height / 2,
                endLeft: endX - horizontalOffset- endRect.width / 2,
            });
            animatingSourcePlanets.push(startPlanetDOM);
        }
        
        animatingSourcePlanets.forEach(p => p.classList.add('planet-ghost'));
        await sleep(50);

        animatingClones.forEach(({ clone, endTop, endLeft }) => {
            clone.style.top = `${endTop}px`;
            clone.style.left = `${endLeft}px`;
        });
        
        await sleep(animationSpeed);

        animatingClones.forEach(({ clone }) => clone.remove());
        nextPlanets.forEach(planet => planet.classList.remove('planet-placeholder'));
        nextStep.classList.remove('step-ghost'); // ← 이 줄을 추가

        nextStep.classList.add('step-ghosted');
    }

    // ✅ sortPlanets 함수를 이 최종 코드로 전체 교체해주세요.
    // ✅ 이 코드로 sortPlanets 함수를 완전히 교체해주세요.
    async function sortPlanets() {
        startBtn.disabled = true;
        
        let currentSortState = [...currentPlanetState];
        let i = 0;
        let stepCounter = 1;

        while (i < currentSortState.length - 1) {
            const fromState = [...currentSortState];

            let minIndex = i;
            for (let j = i + 1; j < fromState.length; j++) {
                if (fromState[j].order < fromState[minIndex].order) {
                    minIndex = j;
                }
            }
            
            const toState = [...fromState];
            if (minIndex !== i) {
                [toState[i], toState[minIndex]] = [toState[minIndex], toState[i]];
            }
            
            // ★★★★★★★★★★ 해결책 ★★★★★★★★★★
            // 1. 이번이 정렬의 마지막 단계인지 확인합니다.
            const isFinalSortStep = (i === currentSortState.length - 2);
            
            // 2. 마지막 단계라면, 정렬 완료 인덱스를 i가 아닌 전체 길이로 설정하여
            //    모든 행성에 정렬 완료 스타일이 적용되도록 합니다.
            const sortedUntilIndex = isFinalSortStep ? currentSortState.length - 1 : i;
            // ★★★★★★★★★★★★★★★★★★★★★★★★★

            // 수정된 인덱스를 사용하여 애니메이션을 호출합니다.
            await animateTransition(fromState, toState, sortedUntilIndex, stepCounter);
            
            currentSortState = toState;
            i++;
            stepCounter++;

            await sleep(700);
        }
        
        // 3. 루프 종료 후 중복으로 호출되던 아래 코드를 "삭제"합니다.
        // currentPlanetState = currentSortState; // 이 줄도 필요 없습니다. 루프가 끝나면 이미 정렬된 상태입니다.
        // const finalSortedState = [...currentPlanetState];
        // await animateTransition(finalSortedState, finalSortedState, finalSortedState.length - 1, stepCounter);

        startBtn.disabled = false;
    }

    startBtn.addEventListener('click', async () => {
        // await를 사용해 initializePlanets가 렌더링 보장 시간까지 포함하여
        // 완전히 끝날 때까지 기다립니다.
        //await initializePlanets();
        sortPlanets();
    });

    initializePlanets();
}
