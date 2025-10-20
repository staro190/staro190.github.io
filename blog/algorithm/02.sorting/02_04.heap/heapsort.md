# 힙 정렬(Heap sorting)

힙은 거의 완전한 이진트리로 높이는 $\log n$ 을 가집니다.
<br>
힙을 배열로 구현하기 위해 arr(0) 을 root, 이후 이진트리 좌측부터 번호를 부여하여 구성합니다.
<br>
<br>
Heapify는 힙의 속성(Max, Min)을 유지하는 과정이며 마지막 노드부터 배열의 모든 노드에 적용합니다.
<br>
적용 시 자연스럽게 Max(혹은 Min) Heap이 만들어집니다.
<br>
<br>
이후 루트 노드를 마지막 노드와 교체한 후 추출하는 Extract-Max(Min)을 수행합니다.
<br>
실제로 추출하는 것은 아니고 공간을 절약하기 위해 힙의 크기만 1 줄입니다.


<br>

## 파이썬 코드

```python
def heap_sort(arr):
  """
  배열을 정렬하는 힙 정렬 알고리즘입니다. (수도코드 수준)
  """
  n = len(arr)

  # 1. 최대 힙(Max Heap) 구성하기
  #    - 배열의 중간부터 시작해서 0번째 인덱스까지 heapify를 호출합니다.
  #    - 이렇게 하면 전체 배열이 최대 힙 구조를 만족하게 됩니다.
  for i in range(n // 2 - 1, -1, -1):
    heapify(arr, n, i)

  # 2. 힙에서 원소를 하나씩 추출하여 정렬하기
  #    - 힙의 루트(가장 큰 값)를 배열의 마지막 요소와 바꿉니다.
  #    - 힙의 크기를 1 줄인 후, 루트 노드에 대해 heapify를 다시 호출하여
  #      최대 힙 속성을 유지합니다.
  for i in range(n - 1, 0, -1):
    arr[i], arr[0] = arr[0], arr[i]  # 루트(최댓값)와 마지막 원소 교환
    heapify(arr, i, 0) # 크기가 줄어든 힙에 대해 heapify 수행

  return arr


def heapify(arr, n, i):
  """
  특정 노드를 루트로 하는 서브트리를 최대 힙으로 만듭니다.
  n: 힙의 크기
  i: 서브트리의 루트 노드 인덱스
  """
  largest = i      # 현재 노드를 가장 큰 값으로 초기 설정
  left = 2 * i + 1   # 왼쪽 자식 노드 인덱스
  right = 2 * i + 2  # 오른쪽 자식 노드 인덱스

  # 왼쪽 자식이 힙의 범위 안에 있고, 부모보다 크면 largest를 업데이트
  if left < n and arr[i] < arr[left]:
    largest = left

  # 오른쪽 자식이 힙의 범위 안에 있고, 현재 largest보다 크면 largest를 업데이트
  if right < n and arr[largest] < arr[right]:
    largest = right

  # largest가 현재 노드(i)가 아니라면, 즉 자식 노드가 더 크다면
  if largest != i:
    # 현재 노드와 largest 노드의 값을 교환
    arr[i], arr[largest] = arr[largest], arr[i]
    # 교환된 위치에서 다시 heapify를 재귀적으로 호출하여
    # 하위 트리까지 최대 힙 속성을 만족시킵니다.
    heapify(arr, n, largest)
```

## 정렬 동작

<div id="solarsys-sort-visualization"></div>

## 시간 복잡도

- **O-notation** = $O(n\log(n))$          
알고리즘을 분석해보면 힙 만들기, 힙 복원, 전체 순환으로 나누어 분석할 수 있습니다.          
   - 힙 만들기는 모든 데이터에 Heapify를 적용하여야 합니다.          
Heapify-Down 시 root가 이동하는 최악의 경우일 때 $\log(n)$이므로 자칫 $n\log(n)$ 으로 오해할 수 있으나 리프를 제외하면 $n$에 가까워집니다. 따라서 $O(n)$ 입니다.
   - 힙 복원은 루트 추출 후 힙을 복원하는 과정입니다.          
하나의 데이터(root)에 대해 Heapify-Down을 수행하므로 $O(\log(n))$ 입니다.
   - 최종적으로 힙 만들기는 한번, 힙 복원은 $n-1$개 데이터에 대해 수행해야 하므로 아래와 같습니다.          
$O((n-1)\log(n)) + O(n) = O(n\log(n))$

## 공간 복잡도 및 특징

- **공간 복잡도**          
배열을 통해 트리를 구성하고 그 배열에서 Swap만을 수행하므로 $O(1)$ 입니다.

- **In-place**          
입력 데이터 공간 자체에서 Swap을 통해 정렬이 가능하므로 In-place합니다.          
추출 시 root와 마지막 노드를 Swap하고 힙 크기만 줄이기 때문에 Max값을 마지막 위치에 그대로 두면 됩니다.

- **Unstable**          
트리 형식으로 진행하기 때문에 Heapify 과정 중 순서가 뒤바뀔 수 있으므로 Stable 하지 않습니다.