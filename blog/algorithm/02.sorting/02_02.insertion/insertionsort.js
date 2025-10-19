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