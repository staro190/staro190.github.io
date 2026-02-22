# 행렬 연쇄 곱셈(Matrix Chain Multiplication)

$n$개의 행렬 $A_1, A_2, \dots, A_n$을 순서대로 곱할 때, **어떤 순서로 괄호를 묶느냐**에 따라 필요한 스칼라 곱셈 횟수가 크게 달라집니다.
<br>
행렬 곱셈은 결합 법칙이 성립하므로 순서를 바꿔 계산할 수 있으며, DP를 사용하여 최소 연산 횟수를 구합니다.


<br>

## 파이썬 코드
```python
def matrix_chain_order(p):
  """
  DP(상향식)를 이용한 행렬 연쇄 곱셈 문제입니다. (수도코드 수준)

  p: 행렬 크기를 나타내는 리스트
     행렬 Ai의 크기는 p[i-1] x p[i]
     예) p = [30, 35, 15, 5, 10, 20, 25] → 행렬 6개
  """
  n = len(p) - 1  # 행렬의 개수

  # 1. DP 테이블 초기화
  # m[i][j] = 행렬 Ai...Aj를 곱하는 데 필요한 최소 스칼라 곱셈 횟수
  # s[i][j] = 최적 분할 위치 k (경로 추적용)
  m = [[0] * (n + 1) for _ in range(n + 1)]
  s = [[0] * (n + 1) for _ in range(n + 1)]

  # 2. 체인 길이(l)를 2부터 n까지 늘려가며 계산
  # l: 현재 계산하는 행렬 체인의 길이
  for l in range(2, n + 1):
    for i in range(1, n - l + 2):
      j = i + l - 1  # 체인의 끝 인덱스
      m[i][j] = float('inf')

      # 3. 점화식 계산: 분할 위치 k를 i부터 j-1까지 탐색
      for k in range(i, j):
        # Ai...Ak를 먼저 곱하고, Ak+1...Aj를 나중에 곱하는 경우의 비용
        # p[i-1] * p[k] * p[j]: 두 결과 행렬을 곱하는 비용
        cost = m[i][k] + m[k+1][j] + p[i-1] * p[k] * p[j]
        if cost < m[i][j]:
          m[i][j] = cost
          s[i][j] = k  # 최적 분할 위치 기록

  # 4. 최종 결과: m[1][n]이 전체 행렬을 곱하는 최소 비용
  return m, s


def print_optimal_parens(s, i, j):
  """
  s 테이블을 이용해 최적 괄호 묶음 순서를 출력합니다.
  """
  if i == j:
    print(f"A{i}", end="")
  else:
    print("(", end="")
    print_optimal_parens(s, i, s[i][j])
    print_optimal_parens(s, s[i][j] + 1, j)
    print(")", end="")


# --- 예시 사용법 ---
# 행렬 6개: A1(30x35), A2(35x15), A3(15x5), A4(5x10), A5(10x20), A6(20x25)
p = [30, 35, 15, 5, 10, 20, 25]
m, s = matrix_chain_order(p)
print(f"최소 스칼라 곱셈 횟수: {m[1][len(p)-1]}")  # 15125
print("최적 괄호 순서: ", end="")
print_optimal_parens(s, 1, len(p) - 1)
```

## 알고리즘 동작

<div class="slideshow-container" data-duration="3000"></div>

## 점화식

- **기저 조건**
행렬이 하나일 때(자기 자신과의 곱)는 연산이 필요 없으므로 0으로 설정
$$m[i][i] = 0$$

- **점화식**
$m[i][j]$는 행렬 $A_i \cdots A_j$를 곱하는 최소 스칼라 곱셈 횟수,
분할 위치 $k$에서 두 구간으로 나눈 뒤 결합하는 비용을 계산합니다.
$p_{i-1} \times p_k \times p_j$는 두 결과 행렬을 곱할 때 드는 비용입니다.
$$m[i][j] = \min_{i \le k < j} \bigl( m[i][k] + m[k+1][j] + p_{i-1} \cdot p_k \cdot p_j \bigr)$$

- **최적 분할 위치**
$s[i][j]$에 최적 $k$를 저장하여 나중에 괄호 순서를 복원합니다.
$$s[i][j] = \arg\min_{i \le k < j} \bigl( m[i][k] + m[k+1][j] + p_{i-1} \cdot p_k \cdot p_j \bigr)$$

## 시간 복잡도

- **O-notation** = $O(n^3)$
체인 길이 $l$을 2부터 $n$까지 반복하고 $(O(n))$,
각 길이에 대해 시작 위치 $i$를 순회하며 $(O(n))$,
각 구간 $[i, j]$에서 분할 위치 $k$를 탐색합니다 $(O(n))$.
따라서 전체 반복 횟수는 $O(n^3)$입니다.

## 공간 복잡도 및 특징

- **공간 복잡도**
최소 비용을 저장하는 $m$ 테이블과 최적 분할 위치를 저장하는 $s$ 테이블이 각각 $(n+1) \times (n+1)$ 크기로 필요합니다.
$$O(n^2) + O(n^2) = O(n^2)$$

- **특징**
행렬 곱셈의 교환 법칙은 성립하지 않으므로 순서는 고정되어 있고, 오직 **괄호를 어디서 묶느냐**만 결정합니다.
$s$ 테이블을 재귀적으로 읽으면 최적 괄호 순서를 $O(n)$에 복원할 수 있습니다.
