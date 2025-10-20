/**
 * 퀵 정렬을 수행하고, 매 단계의 상태를 기록하여 반환합니다.
 * @param {Array} initialState - 정렬할 초기 배열
 * @returns {Array} - 정렬 과정의 모든 단계를 담은 배열
 */
export function quickSortGenerator(initialState) {
    const history = [];
    const arr = [...initialState];
    // 정렬이 완료된(최종 위치가 확정된) 인덱스를 저장하는 Set
    const finalizedIndices = new Set();

    // 초기 상태 기록
    history.push({ state: [...arr], styleInfo: {} });

    /**
     * 재귀적으로 퀵 정렬을 수행하고 history에 기록하는 헬퍼 함수
     * @param {Array} currentArr - 현재 상태의 배열
     * @param {number} low - 정렬할 범위의 시작 인덱스
     * @param {number} high - 정렬할 범위의 끝 인덱스
     */
    function quickSortRecursive(currentArr, low, high) {
        if (low >= high) {
            // 범위 내 원소가 1개 이하일 경우, 해당 원소는 위치가 확정된 것으로 간주
            if (low >= 0 && low < arr.length) finalizedIndices.add(low);
            if (high >= 0 && high < arr.length) finalizedIndices.add(high);
            return;
        }

        // 분할 작업을 시작하기 전의 상태를 기록
        // 어떤 범위를 어떤 피벗으로 정렬할지 시각적으로 보여줌
        history.push({
            state: [...currentArr],
            styleInfo: {
                activeRange: [low, high],
                pivotIndex: high, // 여기서는 마지막 원소를 피벗으로 사용
                finalizedIndices: [...finalizedIndices]
            }
        });

        // 피벗을 기준으로 배열을 분할하고, 피벗의 최종 위치 인덱스를 받음
        const pivotFinalIndex = partition(currentArr, low, high);
        
        // 분할이 끝나면 피벗의 위치는 최종적으로 확정됨
        finalizedIndices.add(pivotFinalIndex);

        // 분할 작업이 완료된 후의 상태를 기록
        history.push({
            state: [...currentArr],
            styleInfo: {
                finalizedIndices: [...finalizedIndices]
            }
        });

        // 피벗을 기준으로 나뉜 두 개의 하위 배열에 대해 재귀적으로 정렬 수행
        quickSortRecursive(currentArr, low, pivotFinalIndex - 1);
        quickSortRecursive(currentArr, pivotFinalIndex + 1, high);
    }

    /**
     * 배열을 피벗 기준으로 분할하고 피벗의 최종 위치를 반환 (Lomuto partition scheme)
     * @param {Array} currentArr - 분할할 배열
     * @param {number} low - 범위의 시작 인덱스
     * @param {number} high - 범위의 끝 인덱스 (피벗의 초기 위치)
     * @returns {number} - 분할 작업 후 피벗의 최종 위치 인덱스
     */
    function partition(currentArr, low, high) {
        const pivot = currentArr[high].order;
        let i = low - 1; // 피벗보다 작은 원소들의 경계를 가리키는 인덱스

        for (let j = low; j < high; j++) {
            // 현재 원소가 피벗보다 작으면, 경계를 확장하고 원소를 교환
            if (currentArr[j].order < pivot) {
                i++;
                [currentArr[i], currentArr[j]] = [currentArr[j], currentArr[i]];
            }
        }
        
        // 피벗을 최종 위치(i + 1)로 이동
        const pivotFinalIndex = i + 1;
        [currentArr[pivotFinalIndex], currentArr[high]] = [currentArr[high], currentArr[pivotFinalIndex]];
        
        return pivotFinalIndex;
    }

    // 메인 정렬 함수 호출
    quickSortRecursive(arr, 0, arr.length - 1);

    // 모든 원소의 위치가 확정된 최종 상태를 기록
    history.push({
        state: [...arr],
        styleInfo: { sortedUntil: arr.length - 1 } // 기존 visualizer 호환용
    });

    return history;
}