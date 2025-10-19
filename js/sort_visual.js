
// =======================================================================
// 태양계 행성 정렬 시각화 로직
// =======================================================================

/**
 * 정렬 시각화 UI를 설정하고, 전달된 알고리즘을 실행할 준비를 합니다.
 * @param {Function} algorithmGenerator - 사용할 정렬 알고리즘 기록 생성기 함수
 */
export function setupPlanetSortVisualization(algorithmGenerator) {
    const vizPlaceholder = document.getElementById('solarsys-sort-visualization');
    if (!vizPlaceholder) return;

    // ... (기존 innerHTML, 변수 선언 등은 동일하게 유지) ...
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
        { name: '수성', order: 0, img: '../img/planets/mercury.png', color: '#9E9E9E', scale: 1.0 },
        { name: '금성', order: 1, img: '../img/planets/venus.png',   color: '#FF7F00', scale: 1.0 },
        { name: '지구', order: 2, img: '../img/planets/earth.png',   color: '#87BC49', scale: 1.0 },
        { name: '화성', order: 3, img: '../img/planets/mars.png',     color: '#E57373', scale: 1.0 },
        { name: '목성', order: 4, img: '../img/planets/jupiter.png', color: '#964B00', scale: 1.0 },
        { name: '토성', order: 5, img: '../img/planets/saturn.png',   color: '#FFF176', scale: 1.0 },
        { name: '천왕성', order: 6, img: '../img/planets/uranus.png', color: '#4DD0E1', scale: 1.0 },
        { name: '해왕성', order: 7, img: '../img/planets/neptune.png', color: '#5C6BC0', scale: 1.0 }
    ];
    let currentPlanetState = [];
    
    // ... (shuffleArray, createStepRow, initializePlanets, sleep, drawTrail, animateTransition 함수는 기존과 동일하게 유지) ...
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

            planetImg.style.setProperty('--planet-specific-scale', planet.scale || 1);

            if (index <= sortedUntilIndex) {
                planetImg.classList.add('planet-sorted');
                planetImg.style.filter = `drop-shadow(0 0 15px ${planet.color})`;
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
    function drawTrail(pathData, color, ...classNames) {
        const trail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        trail.setAttribute('d', pathData);
        trail.classList.add('planet-trail', ...classNames);
        trail.style.stroke = color;
        svgContainer.appendChild(trail);
        const length = trail.getTotalLength();
        if (length === 0) return;
        trail.style.strokeDasharray = length;
        const animationDuration = 1000;
        let startTime = null;
        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / animationDuration, 1);
            const currentOffset = length * (1 - progress);
            trail.style.strokeDashoffset = currentOffset;
            if (progress < 1) requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }
    async function animateTransition(fromState, toState, sortedUntilIndex, stepCounter) {
        historyContainer.appendChild(createStepRow(toState, sortedUntilIndex, stepCounter, []));
        historyContainer.scrollTop = historyContainer.scrollHeight;
        svgContainer.style.height = `${historyContainer.scrollHeight}px`;

        const allSteps = historyContainer.querySelectorAll('.sort-step');
        const prevStepDiv = allSteps[allSteps.length - 2];
        const nextStep = allSteps[allSteps.length - 1];
        
        nextStep.classList.add('step-ghost');
        if (!prevStepDiv) return;

        const prevPlanets = prevStepDiv.querySelectorAll('.planet');
        const nextPlanets = nextStep.querySelectorAll('.planet');

        // ✨ --- [수정된 좌표 계산 로직 시작] --- ✨

        // 1. 애니메이션의 기준이 될 컨테이너의 좌표와 스크롤 위치를 가져옵니다.
        const containerRect = historyContainer.getBoundingClientRect();
        const scrollTop = historyContainer.scrollTop;

        const animatingClones = [];
        
        for (let i = 0; i < fromState.length; i++) {
            const startPlanetData = fromState[i];
            const startPlanetDOM = prevPlanets[i];
            const targetIndexInNextState = toState.findIndex(p => p.order === startPlanetData.order);
            const endPlanetDOM = nextPlanets[targetIndexInNextState];

            if (!startPlanetDOM || !endPlanetDOM) continue;

            const startRect = startPlanetDOM.getBoundingClientRect();
            const endRect = endPlanetDOM.getBoundingClientRect();
            
            if (startRect.width === 0 || endRect.width === 0) continue;

            // 2. 뷰포트 기준 좌표(getBoundingClientRect)에서 컨테이너의 위치를 빼서
            //    컨테이너 내부의 상대적인 top, left 위치를 정확하게 계산합니다.
            const startX = startRect.left - containerRect.left -1;
            const startY = startRect.top + scrollTop - containerRect.top -34;
            const endX = endRect.left - containerRect.left - 1;
            const endY = endRect.top + scrollTop - containerRect.top - 34;

            // 3. 복제된 행성의 위치를 계산된 상대 위치로 설정합니다.
            const clone = startPlanetDOM.cloneNode(true);
            clone.classList.add('planet-animating');
            clone.style.left = `${startX}px`;
            clone.style.top = `${startY}px`;
            historyContainer.appendChild(clone);
            
            animatingClones.push({ clone, endTop: endY, endLeft: endX });

            // 4. 이동 궤적(SVG path)도 행성의 '중심점'을 기준으로 새로 계산합니다.
            const pathData = `M ${startX + startRect.width / 2} ${startY + startRect.height / 2 + 34} L ${endX + endRect.width / 2} ${endY + endRect.height / 2 + 34}`;
            drawTrail(pathData, startPlanetData.color, 'trail-swap');
        }
        
        // ✨ --- [수정된 좌표 계산 로직 끝] --- ✨

        prevPlanets.forEach(p => p.classList.add('planet-ghost'));
        
        await sleep(50);

        animatingClones.forEach(({ clone, endTop, endLeft }) => {
            clone.style.top = `${endTop}px`;
            clone.style.left = `${endLeft}px`;
        });
        
        await sleep(animationSpeed);
        
        animatingClones.forEach(({ clone }) => clone.remove());
        nextStep.classList.remove('step-ghost');
        //prevPlanets.forEach(p => p.classList.remove('planet-ghost'));
    }

    /**
     * 전달받은 알고리즘의 '역사'를 기반으로 애니메이션을 재생합니다.
     * @param {Function} algorithmGenerator - 사용할 정렬 알고리즘 기록 생성기
     */
    async function sortPlanets(algorithmGenerator) {
        startBtn.disabled = true;

        // 1. 선택된 알고리즘을 실행하여 정렬 과정 전체를 '역사'로 받아옵니다.
        const history = algorithmGenerator(currentPlanetState);

        // 2. '역사'를 순회하며 애니메이션을 차례대로 재생합니다.
        for (let i = 1; i < history.length; i++) {
            const fromState = history[i - 1].state;
            const toState = history[i].state;
            const sortedUntilIndex = history[i].sortedUntil;

            await animateTransition(fromState, toState, sortedUntilIndex, i);
            await sleep(500); // 각 단계 사이에 잠시 멈춤
        }

        startBtn.disabled = false;
    }

    startBtn.addEventListener('click', async () => {
        //await initializePlanets();
        // 전달받은 algorithmGenerator를 sortPlanets 함수에 넘겨줍니다.
        sortPlanets(algorithmGenerator);
    });

    initializePlanets();
}
