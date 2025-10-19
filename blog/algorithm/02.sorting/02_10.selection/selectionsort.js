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