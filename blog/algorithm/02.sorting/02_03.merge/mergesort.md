# 병합 정렬(merge sorting)

병합 정렬은 분할 정복 방식을 사용하며 전체 데이터를 2개로 분할하는 것을 나눌 수 없을 때 까지 반복합니다.
<br>
이 방법에서 재귀 호출을 통해 분할(Devide)된 데이터에 다시 병합 정렬을 수행(Conquer)합니다.
<br>
호출을 빠져 나오면서 분할된 데이터들을 정렬하며 병합(Combine)합니다.
<br>
실행 순서 : Devide --> Conquer --> Combine


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

- **점화식(재귀)**          
$
T(n) = 
\begin{cases} 
  \Theta(1) & \text{if } n=1, \\\\
  2T(n/2) + \Theta(n) & \text{if } n>1 
\end{cases}
$

- **O-notation** = $O(n\log(n))$          
점화식을 분석해보면 재귀 호출 부분을 제외할 경우 시간 복잡도가 각 호출에서 $n$이고 총 $\log(n)$번 호출됩니다.          
(경계 조건 생략에 따라 $n$이 1인 작은 케이스는 생략)

## 공간 복잡도 및 특징

- **공간 복잡도**          
정렬 과정에서 원본 배열과 같은 크기의 임시 배열이 필요하므로 $O(n)$ 입니다.

- **Not In-place**          
임시 배열이 필요하므로 In-place가 어렵습니다.

- **Stable**          
분할 과정에서 순서가 바뀌지 않으며 병합 과정에서 순서를 유지하도록 구현할 경우 Stable 합니다.