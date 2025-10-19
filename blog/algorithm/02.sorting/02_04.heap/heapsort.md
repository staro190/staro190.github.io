# 병합 정렬(merge sorting)

삽입 정렬은 정렬된 리스트에 새로운 키(데이터)를 삽입하는 방식으로 진행됩니다.
<br>
배열의 모든 요소를 앞에서부터 차례대로 비교하여 들어가야할 위치를 찾아 삽입합니다.


<br>

## 파이썬 코드

```python
def merge_sort(arr):
  """
  배열을 정렬하는 병합 정렬 알고리즘입니다. (수도코드 수준)
  """
  # 1. 분할 (Divide): 배열의 길이가 1 이하이면 이미 정렬된 것으로 간주합니다.
  if len(arr) <= 1:
    return arr

  # 배열을 두 개의 하위 배열로 분할합니다.
  mid = len(arr) // 2
  left_half = arr[:mid]
  right_half = arr[mid:]

  # 재귀적으로 각 하위 배열을 정렬합니다.
  left_sorted = merge_sort(left_half)
  right_sorted = merge_sort(right_half)

  # 2. 정복 (Conquer): 정렬된 하위 배열들을 병합합니다.
  return merge(left_sorted, right_sorted)


def merge(left, right):
  """
  두 개의 정렬된 하위 배열을 하나의 정렬된 배열로 병합합니다.
  """
  merged_arr = []
  left_pointer, right_pointer = 0, 0

  # 두 하위 배열의 요소를 비교하며 작은 값을 결과 배열에 추가합니다.
  while left_pointer < len(left) and right_pointer < len(right):
    if left[left_pointer] < right[right_pointer]:
      merged_arr.append(left[left_pointer])
      left_pointer += 1
    else:
      merged_arr.append(right[right_pointer])
      right_pointer += 1

  # 한쪽 하위 배열에 남아있는 요소들을 결과 배열에 추가합니다.
  # (이미 정렬되어 있으므로 그대로 이어 붙입니다.)
  merged_arr.extend(left[left_pointer:])
  merged_arr.extend(right[right_pointer:])

  return merged_arr
```

## 정렬 동작

<div id="solarsys-sort-visualization"></div>

## 시간 복잡도

- Θ($n^2$)          
입력 개수 n개 만큼 확인해야 하며 각 이동 시 n번 데이터를 이동해야 합니다.

## 기타

- **Stable**          
앞에서 부터 순차적으로 진행하고 같은 경우 다음 순번으로 삽입한다면 Stable 합니다.