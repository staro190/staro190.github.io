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
