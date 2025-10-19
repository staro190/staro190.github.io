# 삽입 정렬(insertion sorting)

삽입 정렬은 정렬된 리스트에 새로운 키(데이터)를 삽입하는 방식으로 진행됩니다.
<br>
배열의 모든 요소를 앞에서부터 차례대로 비교하여 들어가야할 위치를 찾아 삽입합니다.


<br>

## 파이썬 코드

```python
def insertion_sort(arr):
    """리스트를 삽입 정렬 알고리즘으로 정렬합니다."""
    # 리스트의 두 번째 요소(인덱스 1)부터 시작
    for i in range(1, len(arr)):
        key = arr[i]  # 삽입할 요소
        j = i - 1
        
        # key보다 큰 요소를 오른쪽으로 한 칸씩 이동시켜
        # 삽입될 공간을 마련합니다.
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            j -= 1
        
        # 찾은 위치에 key를 삽입
        arr[j + 1] = key
        
    return arr
```

## 정렬 동작

<div id="solarsys-sort-visualization"></div>

## 시간 복잡도

- Θ($n^2$)          
입력 개수 n개 만큼 확인해야 하며 각 이동 시 n번 데이터를 이동해야 합니다.

## 공간 복잡도 및 특징

- **공간 복잡도**          
정렬 과정에서 데이터 Swap을 위한 공간이 하나 필요하므로 $O(1)$ 입니다.

- **In-place**          
입력 데이터 공간 자체에서 Swap을 통해 정렬이 가능하므로 In-place합니다.

- **Stable**          
앞에서 부터 순차적으로 진행하고 같은 경우 다음 순번으로 삽입한다면 Stable 합니다.