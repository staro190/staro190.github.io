# 퀵 정렬(Quick sorting)

퀵 정렬은 분할 정복 방식을 사용하며 전체 데이터를 피벗 기준으로 분할(Partition/Devide)하고 분할된 데이터를 다시 퀵 정렬하는 것을 반복(Conquer)합니다.
<br>
일반적으로 마지막 요소를 피벗으로 지정합니다. 또한 low, high가 교차(분할된 데이터가 1개 이하)되면 재귀를 종료합니다.
<br>
<br>
실질적인 Swap 부분은 Partition 부분에 존재합니다.
<br>
커서/포인터를 올려가면서 피벗보다 작은 값들을 모두 왼쪽으로 옮깁니다.
<br>
모든 요소에 대해 수행한 후 마지막 커서/포인터 다음 위치로 피벗값을 옮깁니다.
<br>
이 경우 데이터를 시프트할 필요 없이 Swap합니다(우측도 다시 정렬될 예정).
<br>


<br>

## 파이썬 코드

```python
def quick_sort(arr, low, high):
  """
  배열의 특정 부분을 정렬하는 퀵 정렬 알고리즘입니다. (수도코드 수준)
  arr: 정렬할 배열
  low: 정렬할 부분의 시작 인덱스
  high: 정렬할 부분의 끝 인덱스
  """
  # 1. 재귀 호출의 기본 조건: 정렬할 부분이 1개 이하의 원소를 가질 때
  if low < high:
    # 2. 파티션(분할)을 수행하고 피벗(pivot)의 최종 위치를 받음
    #    - 피벗을 기준으로 왼쪽에는 피벗보다 작은 값들,
    #      오른쪽에는 피벗보다 큰 값들이 위치하게 됨
    pivot_index = partition(arr, low, high)

    # 3. 정복 (Conquer): 피벗을 기준으로 나누어진 두 개의 하위 배열에 대해
    #    재귀적으로 퀵 정렬을 호출함
    quick_sort(arr, low, pivot_index - 1)  # 피벗 왼쪽 부분 정렬
    quick_sort(arr, pivot_index + 1, high) # 피벗 오른쪽 부분 정렬

def partition(arr, low, high):
  """
  배열의 한 부분을 분할하고 피벗의 최종 위치를 반환합니다.
  (로무토 파티션 방식)
  """
  # 1. 피벗(pivot)을 정렬할 부분의 가장 오른쪽 원소로 선택
  pivot = arr[high]
  
  # i는 피벗보다 작은 원소들이 들어갈 위치를 가리키는 포인터
  i = low - 1

  # 2. low부터 high-1까지 모든 원소를 순회하며 피벗과 비교
  for j in range(low, high):
    # 현재 원소(arr[j])가 피벗보다 작거나 같으면
    if arr[j] <= pivot:
      # i를 1 증가시키고, arr[i]와 arr[j]의 위치를 교환(swap)
      i += 1
      arr[i], arr[j] = arr[j], arr[i]

  # 3. 순회가 끝난 후, 피벗(arr[high])을 i+1 위치의 원소와 교환
  #    - 이렇게 하면 arr[i+1]에 피벗이 위치하게 됨
  arr[i + 1], arr[high] = arr[high], arr[i + 1]

  # 4. 피벗의 최종 위치 인덱스를 반환
  return i + 1

```

## 정렬 동작

<div id="solarsys-sort-visualization"></div>

## 시간 복잡도

- **점화식(재귀)**          
$
T(n) = 
\begin{cases} 
  2T(n/2) + \Theta(n) & \text{if }\ split \ equally, \\\\
  2T(n-1) + \Theta(n) & \text{if }\ split \ extremely \ equally \ (worst)
\end{cases}
$


- **Θ-notation** = $Θ(n\log(n))$          
알고리즘을 분석해보면 Partition, 재귀 분할로 나누어 분석할 수 있습니다.          
   - Partition은 부분 배열을 순환하므로 $Θ(n)$입니다.
   - 재귀 분할은 병합 정렬과 달리 분할 위치에 따라 달라질 수 있습니다.          
한쪽으로 치우치며 피벗이 지정될 경우 최악의 경우로 $Θ(n)$에 가까워지고 가운데로 잘 분할되는 경우 평균적으로 $Θ(\log(n))$가 됩니다.
   - 최종적으로 분할 이후 부분 배열에 모두 Partition을 수행해야 하므로 아래와 같습니다.          
평균/기대치 : $Θ(n\log(n))$          
최악 : $Θ(n^2)$          
- **회피 전략**          
최악의 경우가 발생하는 확률을 낮추기 위해 피벗을 무작위로 선택하는 전략(Randomized Quicksort)도 있습니다.

## 공간 복잡도 및 특징

- **공간 복잡도**          
입력 배열에서 Swap만을 수행하므로 $O(1)$ 입니다.          
재귀 호출로 인한 스택 영역의 공간 사용의 경우 평균 $O(\log(n))$, 최악의 경우 $O(n)$ 입니다.

- **In-place**          
입력 데이터 공간 자체에서 Swap을 통해 정렬이 가능하므로 In-place합니다.          

- **Unstable**          
Partition 과정 중 순서가 뒤바뀔 수 있으므로 Stable 하지 않습니다.