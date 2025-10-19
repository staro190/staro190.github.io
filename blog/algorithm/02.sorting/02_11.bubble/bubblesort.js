/**
 * 버블 정렬을 수행하고, 매 단계의 상태를 기록하여 반환합니다.
 * @param {Array} initialState - 정렬할 초기 배열
 * @returns {Array} - 정렬 과정의 모든 단계를 담은 배열
 */
export function bubbleSortGenerator(initialState) {
    const history = [];
    const arr = [...initialState];
    const n = arr.length;

    // 초기 상태를 기록합니다. 정렬된 부분이 없으므로 sortedFrom을 n으로 설정합니다.
    history.push({ state: [...arr], styleInfo: { sortedFrom: n } });

    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        // 각 패스(pass)마다 이웃한 원소를 비교하고 필요시 교환합니다.
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j].order > arr[j + 1].order) {
                // 원소 교환
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        
        // 한 번의 패스가 끝난 후의 상태를 기록합니다.
        // 가장 큰 원소가 제자리를 찾았으므로 정렬된 구간이 오른쪽에서부터 하나씩 늘어납니다.
        history.push({ state: [...arr], styleInfo: { sortedFrom: n - 1 - i } });

        // 최적화: 만약 이번 패스에서 교환이 한 번도 일어나지 않았다면,
        // 배열이 이미 정렬된 것이므로 더 이상 진행할 필요가 없습니다.
        if (!swapped) {
            break;
        }
    }

    // 최종적으로 완전히 정렬된 상태를 기록합니다.
    history.push({ state: [...arr], styleInfo: { sortedFrom: 0 } });
    
    return history;
}