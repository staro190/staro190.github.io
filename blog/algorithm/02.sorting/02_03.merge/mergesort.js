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