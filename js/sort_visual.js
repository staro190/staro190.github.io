// common.js에서 initializeBackground를 가져오는 부분은 삭제해도 됩니다. blog.js에서 관리합니다.

// =======================================================================
// 1. 각 정렬 알고리즘 구현 (기록 생성기)
// =======================================================================

/**
 * 삽입 정렬을 수행하고, 매 단계의 상태를 기록하여 반환합니다.
 * @param {Array} initialState - 정렬할 초기 배열
 * @returns {Array} - 정렬 과정의 모든 단계를 담은 배열
 */
export function insertionSortGenerator(initialState) {
    const history = [];
    const arr = [...initialState];

    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;

        // 매 단계 시작 시 상태를 기록
        history.push({ state: [...arr], sortedUntil: i - 1 });

        while (j >= 0 && arr[j].order > key.order) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }

    // 최종 정렬된 상태를 기록
    history.push({ state: [...arr], sortedUntil: arr.length - 1 });
    return history;
}

/**
 * 선택 정렬을 수행하고, 매 단계의 상태를 기록하여 반환합니다.
 * @param {Array} initialState - 정렬할 초기 배열
 * @returns {Array} - 정렬 과정의 모든 단계를 담은 배열
 */
export function selectionSortGenerator(initialState) {
    const history = [];
    const arr = [...initialState];

    for (let i = 0; i < arr.length - 1; i++) {
        let minIndex = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j].order < arr[minIndex].order) {
                minIndex = j;
            }
        }
        
        // 교환 전 상태를 기록
        history.push({ state: [...arr], sortedUntil: i - 1 });

        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        }
    }

    // 최종 정렬된 상태를 기록
    history.push({ state: [...arr], sortedUntil: arr.length - 1 });
    return history;
}
/**
 * 병합 정렬을 수행하고, 매 단계의 상태를 기록하여 반환합니다.
 * @param {Array} initialState - 정렬할 초기 배열
 * @returns {Array} - 정렬 과정의 모든 단계를 담은 배열
 */
export function mergeSortGenerator(initialState) {
    const history = [];
    const arr = [...initialState];
    const n = arr.length;

    // 초기 상태 기록
    history.push({ 
        state: [...arr], 
        styleInfo: {} 
    });

    /**
     * 재귀적으로 병합 정렬을 수행하고 history에 기록하는 헬퍼 함수
     * @param {Array} currentArr - 현재 상태의 배열
     * @param {number} left - 정렬할 범위의 시작 인덱스
     * @param {number} right - 정렬할 범위의 끝 인덱스
     */
    function mergeSortRecursive(currentArr, left, right) {
        if (left >= right) {
            return; // 배열의 크기가 1 이하면 반환
        }

        const mid = Math.floor(left + (right - left) / 2);

        // 왼쪽과 오른쪽 하위 배열을 재귀적으로 정렬
        mergeSortRecursive(currentArr, left, mid);
        mergeSortRecursive(currentArr, mid + 1, right);
        
        // 정렬된 두 하위 배열을 병합
        merge(currentArr, left, mid, right);
    }

    /**
     * 두 개의 정렬된 하위 배열을 병합하는 함수
     * @param {Array} currentArr - 병합할 배열
     * @param {number} left - 왼쪽 하위 배열의 시작 인덱스
     * @param {number} mid - 왼쪽 하위 배열의 끝 인덱스
     * @param {number} right - 오른쪽 하위 배열의 끝 인덱스
     */
    function merge(currentArr, left, mid, right) {
        // 병합할 두 하위 배열(왼쪽, 오른쪽)을 시각적으로 강조하기 위한 상태를 기록합니다.
        // visualizer는 이 정보를 사용해 해당 영역을 다르게 표시할 수 있습니다.
        history.push({
            state: [...currentArr],
            styleInfo: { highlightRanges: [[left, mid], [mid + 1, right]] }
        });

        // 임시 배열에 왼쪽과 오른쪽 하위 배열을 복사
        const leftArr = currentArr.slice(left, mid + 1);
        const rightArr = currentArr.slice(mid + 1, right + 1);

        let i = 0; // leftArr 순회용 인덱스
        let j = 0; // rightArr 순회용 인덱스
        let k = left; // 원래 배열(currentArr)에 다시 채워넣을 위치의 인덱스

        // 두 배열의 원소를 비교하며 작은 것부터 순서대로 원래 배열에 삽입
        while (i < leftArr.length && j < rightArr.length) {
            if (leftArr[i].order <= rightArr[j].order) {
                currentArr[k] = leftArr[i];
                i++;
            } else {
                currentArr[k] = rightArr[j];
                j++;
            }
            k++;
        }

        // 한쪽 배열의 원소가 모두 소진된 경우, 남은 다른 쪽 배열의 원소들을 모두 복사
        while (i < leftArr.length) {
            currentArr[k] = leftArr[i];
            i++;
            k++;
        }
        while (j < rightArr.length) {
            currentArr[k] = rightArr[j];
            j++;
            k++;
        }

        // 병합이 완료되어 정렬된 상태를 기록합니다.
        // visualizer는 이 정보를 사용해 병합된 영역이 정렬되었음을 표시할 수 있습니다.
        history.push({
            state: [...currentArr],
            styleInfo: { sortedRanges: [[left, right]] }
        });
    }

    // 메인 정렬 함수 호출
    mergeSortRecursive(arr, 0, n - 1);

    // 최종적으로 완전히 정렬된 상태를 기록합니다.
    // 기존 visualizer와의 호환성을 위해 sortedUntil을 사용합니다.
    history.push({ 
        state: [...arr], 
        styleInfo: { sortedUntil: n - 1 } 
    });

    return history;
}
/**
 * 힙 정렬을 수행하고, 매 단계의 상태를 기록하여 반환합니다.
 * @param {Array} initialState - 정렬할 초기 배열
 * @returns {Array} - 정렬 과정의 모든 단계를 담은 배열
 */
export function heapSortGenerator(initialState) {
    const history = [];
    const arr = [...initialState];
    const n = arr.length;

    function heapify(arr, n, i, sortedFromIndex) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < n && arr[left].order > arr[largest].order) largest = left;
        if (right < n && arr[right].order > arr[largest].order) largest = right;

        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            history.push({ state: [...arr], styleInfo: { sortedFrom: sortedFromIndex } });
            heapify(arr, n, largest, sortedFromIndex);
        }
    }

    // 최대 힙 구성
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i, n);
    }

    // 힙에서 원소 추출 및 정렬
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        history.push({ state: [...arr], styleInfo: { sortedFrom: i } });
        heapify(arr, i, 0, i);
    }
    
    history.push({ state: [...arr], styleInfo: { sortedFrom: 0 } });
    return history;
}

// =======================================================================
// 2. 태양계 행성 정렬 시각화 로직
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
        { name: '수성', order: 0, img: '../img/planets/mercury.png', color: '#9E9E9E' },
        { name: '금성', order: 1, img: '../img/planets/venus.png',   color: '#FF7F00' },
        { name: '지구', order: 2, img: '../img/planets/earth.png',   color: '#87BC49' },
        { name: '화성', order: 3, img: '../img/planets/mars.png',     color: '#E57373' },
        { name: '목성', order: 4, img: '../img/planets/jupiter.png', color: '#964B00' },
        { name: '토성', order: 5, img: '../img/planets/saturn.png',   color: '#FFF176' },
        { name: '천왕성', order: 6, img: '../img/planets/uranus.png', color: '#4DD0E1' },
        { name: '해왕성', order: 7, img: '../img/planets/neptune.png', color: '#5C6BC0' }
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
        let horizontalOffset = 0;
        const firstStepElement = document.querySelector('.planet');
        if (firstStepElement) {
            const styles = window.getComputedStyle(firstStepElement);
            horizontalOffset = parseFloat(styles.marginLeft); 
        }
        const movingIndices = [];
        for (let i = 0; i < fromState.length; i++) {
            if (fromState[i].order !== toState[i].order) { movingIndices.push(i); }
        }
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
            const scrollTop = historyContainer.scrollTop;
            const startX = startRect.left - containerRect.left - borderLeft + startRect.width / 2;
            const startY = startRect.top - containerRect.top - borderTop + startRect.height / 2 + scrollTop;
            const endX = endRect.left - containerRect.left - borderLeft + endRect.width / 2;
            const endY = endRect.top - containerRect.top - borderTop + endRect.height / 2 + scrollTop;
            const color = startPlanetData.color;
            const pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
            const trailClass = (movingIndices.includes(i) || toState.findIndex(p => p.order === fromState[i].order) !== i) ? 'trail-swap' : 'trail-straight';
            drawTrail(pathData, color, trailClass);
            const clone = startPlanetDOM.cloneNode();
            clone.classList.add('planet-animating');
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
        nextStep.classList.remove('step-ghost');
        nextStep.classList.add('step-ghosted');
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

        // ============= ✅ 최종 정리 단계 추가 =============
        console.log("최종 정리 단계를 실행합니다.");

        /*
        // 1. 모든 애니메이션 요소(궤적, 복제 행성)를 확실하게 제거합니다.
        svgContainer.innerHTML = '';
        historyContainer.querySelectorAll('.planet-animating').forEach(el => el.remove());
        */
        // 2. 기록된 가장 마지막 상태(완전히 정렬된 상태)를 가져옵니다.
        const finalStepData = history[history.length - 1];

        // 3. 마지막 상태만을 이용해 완벽하고 깔끔한 최종 행성 줄을 생성합니다.
        const finalStepRow = createStepRow(finalStepData.state, finalStepData.styleInfo, 'FINAL');
        finalStepRow.forEach(planet => planet.classList.remove('planet-placeholder'));
        
        // 4. 이전의 모든 기록(STEP 1, 2, ...)을 지우고 최종 결과만 남깁니다.
        //historyContainer.innerHTML = ''; // 모든 STEP 제거
        historyContainer.appendChild(finalStepRow); // 최종 결과만 추가
        //historyContainer.scrollTop = 0; // 스크롤을 맨 위로 올림
        // ===============================================

        startBtn.disabled = false;
    }

    startBtn.addEventListener('click', async () => {
        //await initializePlanets();
        // 전달받은 algorithmGenerator를 sortPlanets 함수에 넘겨줍니다.
        sortPlanets(algorithmGenerator);
    });

    initializePlanets();
}
