# 최장 공통 부분 수열(Longest Common Subsequence)

두 수열 $X$와 $Y$가 있을 때, 둘 모두에 공통으로 포함되는 **가장 긴 부분 수열**을 찾는 문제입니다.
<br>
부분 수열(Subsequence)은 원래 순서를 유지하되 연속하지 않아도 되며, DP를 사용하여 $O(mn)$ 시간에 해결합니다.


<br>

## 파이썬 코드
```python
def lcs_bottom_up(X, Y):
  """
  DP(상향식)를 이용한 LCS 길이 계산입니다. (수도코드 수준)

  X, Y: 문자열 (또는 원소의 리스트)
  반환값: LCS의 길이
  """
  m = len(X)
  n = len(Y)

  # 1. DP 테이블 초기화
  # c[i][j] = X[1..i]와 Y[1..j]의 LCS 길이
  # 크기는 (m+1) x (n+1), 테두리(0번 행/열)는 모두 0으로 설정
  c = [[0] * (n + 1) for _ in range(m + 1)]

  # 2. DP 테이블 채우기
  for i in range(1, m + 1):
    for j in range(1, n + 1):

      # 3. 점화식 적용
      if X[i-1] == Y[j-1]:
        # 문자 일치: 대각선 값 + 1
        c[i][j] = c[i-1][j-1] + 1
      else:
        # 문자 불일치: 위쪽과 왼쪽 중 큰 값 선택
        c[i][j] = max(c[i-1][j], c[i][j-1])

  # 4. 최종 LCS 길이 반환
  return c[m][n]


def lcs_traceback(X, Y, c):
  """
  c 테이블을 역추적하여 실제 LCS 문자열을 반환합니다.
  """
  i, j = len(X), len(Y)
  result = []

  while i > 0 and j > 0:
    if X[i-1] == Y[j-1]:
      # 일치한 문자 → LCS에 포함, 대각선으로 이동
      result.append(X[i-1])
      i -= 1
      j -= 1
    elif c[i-1][j] >= c[i][j-1]:
      i -= 1   # 위쪽으로 이동
    else:
      j -= 1   # 왼쪽으로 이동

  return ''.join(reversed(result))


# --- 예시 사용법 ---
X = "ABCD"
Y = "ACDB"

m, n = len(X), len(Y)
c = [[0] * (n + 1) for _ in range(m + 1)]

for i in range(1, m + 1):
  for j in range(1, n + 1):
    if X[i-1] == Y[j-1]:
      c[i][j] = c[i-1][j-1] + 1
    else:
      c[i][j] = max(c[i-1][j], c[i][j-1])

print(f"LCS 길이: {c[m][n]}")           # 3
print(f"LCS: {lcs_traceback(X, Y, c)}") # ACD
```

## 알고리즘 동작

<div class="slideshow-container" data-duration="3000"></div>

## 점화식

- **기저 조건**
어느 한쪽 수열이 비어 있으면 공통 부분 수열도 존재하지 않습니다.
$$c[i][0] = 0, \quad c[0][j] = 0$$

- **점화식**
$c[i][j]$는 $X[1..i]$와 $Y[1..j]$의 LCS 길이입니다.
문자 $X[i]$와 $Y[j]$가 **일치**하면 대각선 값에 1을 더하고,
**불일치**하면 위쪽($c[i-1][j]$)과 왼쪽($c[i][j-1]$) 중 큰 값을 선택합니다.
$$c[i][j] = \begin{cases} c[i-1][j-1] + 1 & \text{if } X[i] = Y[j] \\ \max(c[i-1][j],\; c[i][j-1]) & \text{if } X[i] \neq Y[j] \end{cases}$$

- **역추적(Traceback)**
$c[m][n]$에서 출발하여 일치 셀을 따라 대각선으로 이동하면 LCS 문자열을 복원할 수 있습니다.

## 시간 복잡도

- **O-notation** = $O(mn)$
$X$의 길이를 $m$, $Y$의 길이를 $n$이라 할 때,
DP 테이블 전체 $(m+1) \times (n+1)$을 채우며 각 셀에서 상수 번 연산을 수행합니다.
따라서 $O(mn)$이고, 역추적은 $O(m+n)$입니다.

## 공간 복잡도 및 특징

- **공간 복잡도**
전체 테이블을 저장하면 $O(mn)$이 필요합니다.
LCS 길이만 필요하다면 현재 행과 이전 행 두 줄만 유지하면 되므로 $O(\min(m, n))$으로 줄일 수 있습니다.

- **특징**
LCS는 문자열 비교, diff 알고리즘, 생물정보학(유전자 배열 비교) 등 다양한 분야에서 핵심 알고리즘으로 활용됩니다.
