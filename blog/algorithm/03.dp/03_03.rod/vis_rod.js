/**
 * vis_rod.js — 막대 자르기 DP 배열 캔버스 애니메이션
 *
 * blog.js의 canvasVis 메타 필드로 불러오며,
 * .slideshow-container 요소를 캔버스 UI로 교체합니다.
 */

const PRICES = [2, 5, 7, 8, 10]; // 길이 1~5의 가격
const N      = PRICES.length;    // 막대 최대 길이 = 5

/* ── 레이아웃 상수 (Canvas 700×440) ── */
const W = 700, H = 440;
const PX = 15, HW = 55, CW = 72, CH = 55; // 좌측 패딩 / 헤더 너비 / 셀 크기
const PRICE_Y = 38;   // 가격표 Y
const DP_Y    = 118;  // dp 배열 Y
const ROD_Y   = 193;  // 막대 시각화 Y
const ROD_H   = 52;   // 막대 높이
const RX = PX + HW + (N + 1) * CW + 16;  // 우측 패널 X
const RW = W - RX - 8;                    // 우측 패널 너비
const DESC_Y  = 358;  // 설명 영역 Y

/* ── 색상 팔레트 (vis_matrix.js와 동일한 테마) ── */
const C = {
    bg:      '#050a10',
    empty:   'rgba(8,20,32,0.9)',
    zero:    'rgba(0,50,70,0.85)',
    done:    'rgba(0,40,65,0.9)',
    act:     'rgba(0,120,170,0.75)',
    res:     'rgba(100,65,0,0.55)',
    border:  'rgba(0,212,255,0.22)',
    bdrAct:  '#00d4ff',
    bdrRes:  '#ffd700',
    cyan:    '#00d4ff',
    gold:    '#ffd700',
    white:   '#e8e8e8',
    dim:     '#3a5060',
    sub:     '#90b0c0',
    rodCut:  'rgba(0,170,140,0.75)', // 잘린 조각 (청록)
    rodRem:  'rgba(0,55,85,0.85)',   // 나머지 조각 (어두운 파랑)
    rodLine: 'rgba(0,212,255,0.45)', // 막대 구분선
};

/* ════════════════════════════════════════════
   공개 API: initialize()
════════════════════════════════════════════ */
export function initialize() {
    const container = document.querySelector('.slideshow-container');
    if (!container) return;

    container.style.cssText =
        'position:relative; background:#050a10; border-radius:8px; overflow:hidden; padding:0;';
    container.innerHTML = '';

    /* Canvas — 컨테이너 실제 너비 + devicePixelRatio 기반으로 정확히 보정 */
    const dpr      = window.devicePixelRatio || 1;
    const displayW = container.clientWidth   || W;
    const displayH = Math.round(displayW * H / W);
    const canvas   = document.createElement('canvas');
    canvas.width   = displayW * dpr;
    canvas.height  = displayH * dpr;
    canvas.style.width   = displayW + 'px';
    canvas.style.height  = displayH + 'px';
    canvas.style.display = 'block';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr * displayW / W, dpr * displayH / H);

    /* 컨트롤 바 */
    const bar = document.createElement('div');
    bar.style.cssText =
        'display:flex; justify-content:center; align-items:center; gap:8px;' +
        'padding:7px 12px; background:rgba(0,25,40,0.95);' +
        'border-top:1px solid rgba(0,212,255,0.15);';

    const bs =
        'background:rgba(0,212,255,0.12); color:#00d4ff;' +
        'border:1px solid rgba(0,212,255,0.35); border-radius:4px;' +
        'padding:4px 14px; cursor:pointer; font:13px monospace;';

    const prevBtn = Object.assign(document.createElement('button'), { textContent: '‹ 이전' });
    const playBtn = Object.assign(document.createElement('button'), { textContent: '▶ 재생' });
    const nextBtn = Object.assign(document.createElement('button'), { textContent: '다음 ›' });
    const label   = document.createElement('span');

    [prevBtn, playBtn, nextBtn].forEach(b => (b.style.cssText = bs));
    label.style.cssText =
        'color:#506070; font:12px monospace; min-width:64px; text-align:center;';

    bar.append(prevBtn, playBtn, nextBtn, label);
    container.appendChild(bar);

    /* 프레임 시퀀스 */
    const frames = buildFrames();
    let cur = 0, timer = null;

    const render = () => {
        drawFrame(ctx, frames[cur]);
        label.textContent = `${cur + 1} / ${frames.length}`;
    };

    const stop = () => {
        clearInterval(timer);
        timer = null;
        playBtn.textContent = '▶ 재생';
    };

    const play = () => {
        timer = setInterval(() => {
            cur = (cur + 1) % frames.length;
            render();
            if (cur === frames.length - 1) stop();
        }, 1400);
        playBtn.textContent = '⏸ 정지';
    };

    prevBtn.onclick = () => { stop(); cur = (cur - 1 + frames.length) % frames.length; render(); };
    nextBtn.onclick = () => { stop(); cur = (cur + 1) % frames.length;                 render(); };
    playBtn.onclick = () => (timer ? stop() : play());

    render();
}

/* ════════════════════════════════════════════
   프레임 시퀀스 생성
════════════════════════════════════════════ */
function buildFrames() {
    const frames = [];
    const dp = new Array(N + 1).fill(null);

    const snap = (activeI, activeJ, tried, desc, subDesc, isResult = false) =>
        frames.push({
            dp: [...dp],
            activeI,
            activeJ,
            tried: tried.map(t => ({ ...t })),
            desc,
            subDesc,
            isResult,
        });

    /* Frame 0: 빈 배열 */
    snap(null, null, [],
        '막대를 잘라 최대 판매 수익을 구합니다',
        'dp[i] = 길이가 i인 막대의 최대 판매 수익');

    /* Frame 1: 기저 조건 dp[0] = 0 */
    dp[0] = 0;
    snap(null, null, [],
        '기저 조건: 길이가 0인 막대의 수익은 0',
        'dp[0] = 0');

    /* dp[1] ~ dp[N] 계산 */
    for (let i = 1; i <= N; i++) {
        let best = -Infinity;
        const tried = [];

        for (let j = 1; j <= i; j++) {
            const price    = PRICES[j - 1];
            const remainder = dp[i - j];
            const cost     = price + remainder;

            if (cost > best) best = cost;
            dp[i] = best;
            tried.push({ j, cost });

            snap(
                i, j, tried,
                `dp[${i}] 계산 중  (j = ${j})`,
                `p[${j}](=${price}) + dp[${i - j}](=${remainder}) = ${cost}`
            );
        }
    }

    /* 최종 결과 */
    snap(
        null, null, [],
        `최대 판매 수익: dp[${N}] = ${dp[N]}`,
        '최적 분할 예:  길이 1 + 2 + 2  →  수익 2 + 5 + 5 = 12',
        true
    );

    return frames;
}

/* ════════════════════════════════════════════
   단일 프레임 렌더링
════════════════════════════════════════════ */
function drawFrame(ctx, frame) {
    const { dp, activeI, activeJ, tried, desc, subDesc, isResult } = frame;

    /* 배경 */
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    /* 제목 */
    ctx.font = 'bold 15px Orbitron, monospace';
    ctx.fillStyle = C.cyan;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('막대 자르기 DP 배열', W / 2, 22);

    /* ── 가격표 (2행: 길이 / 가격) ── */
    const ROW_H = 36; // 가격표 행 높이

    const priceHeaders = ['길이', '가격'];
    priceHeaders.forEach((hdr, row) => {
        /* 행 레이블 */
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = C.cyan;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hdr, PX + HW / 2, PRICE_Y + row * ROW_H + ROW_H / 2);

        /* 셀 (길이 1~N, dp[j]와 x축 정렬) */
        for (let j = 1; j <= N; j++) {
            const cx  = PX + HW + j * CW;        // dp[j]와 같은 x
            const cy  = PRICE_Y + row * ROW_H;
            const val = row === 0 ? j : PRICES[j - 1];

            ctx.fillStyle = 'rgba(0,40,60,0.85)';
            ctx.fillRect(cx, cy, CW, ROW_H);
            ctx.strokeStyle = C.border;
            ctx.lineWidth = 0.8;
            ctx.strokeRect(cx, cy, CW, ROW_H);

            ctx.font = '12px monospace';
            ctx.fillStyle = row === 0 ? C.sub : C.cyan;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(val), cx + CW / 2, cy + ROW_H / 2);
        }
    });

    /* ── dp 배열 (dp[0] ~ dp[N]) ── */
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = C.cyan;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('dp[i]', PX + HW / 2, DP_Y + CH / 2);

    for (let i = 0; i <= N; i++) {
        const cx    = PX + HW + i * CW;
        const val   = dp[i];
        const isAct = activeI === i;
        const isRes = isResult && i === N;

        let bg, stroke, glow = null;
        if      (isRes)      { bg = C.res;   stroke = C.bdrRes; glow = C.gold; }
        else if (isAct)      { bg = C.act;   stroke = C.bdrAct; glow = C.cyan; }
        else if (val === 0)  { bg = C.zero;  stroke = C.border; }
        else if (val !== null){ bg = C.done;  stroke = C.border; }
        else                 { bg = C.empty; stroke = 'rgba(0,212,255,0.10)'; }

        ctx.fillStyle = bg;
        ctx.fillRect(cx, DP_Y, CW, CH);

        if (glow) {
            ctx.save();
            ctx.shadowColor = glow;
            ctx.shadowBlur  = 20;
            ctx.strokeStyle = stroke;
            ctx.lineWidth   = 2;
            ctx.strokeRect(cx + 1, DP_Y + 1, CW - 2, CH - 2);
            ctx.restore();
        } else {
            ctx.strokeStyle = stroke;
            ctx.lineWidth   = 0.8;
            ctx.strokeRect(cx, DP_Y, CW, CH);
        }

        /* 인덱스 레이블 */
        ctx.font = '10px monospace';
        ctx.fillStyle = C.dim;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`[${i}]`, cx + CW / 2, DP_Y + 3);

        /* 값 */
        if (val !== null) {
            ctx.font = 'bold 15px monospace';
            ctx.fillStyle = isRes ? C.gold : (isAct ? C.white : C.cyan);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(val), cx + CW / 2, DP_Y + CH / 2 + 5);
        }
    }

    /* ── 막대 시각화 ── */
    if (activeI !== null && activeJ !== null) {
        const i = activeI, j = activeJ;
        const rodX = PX + HW;  // 막대 시작 x (dp[0] 셀 오른쪽)

        /* 잘린 조각 (길이 j) */
        ctx.fillStyle = C.rodCut;
        ctx.fillRect(rodX + CW, ROD_Y, j * CW, ROD_H); // dp[1]부터 시작 (= rodX+CW)

        /* 나머지 조각 (길이 i-j) */
        if (i - j > 0) {
            ctx.fillStyle = C.rodRem;
            ctx.fillRect(rodX + CW + j * CW, ROD_Y, (i - j) * CW, ROD_H);
        }

        /* 막대 전체 테두리 */
        ctx.strokeStyle = C.bdrAct;
        ctx.lineWidth   = 1.5;
        ctx.strokeRect(rodX + CW, ROD_Y, i * CW, ROD_H);

        /* 단위 구분선 */
        ctx.strokeStyle = C.rodLine;
        ctx.lineWidth   = 0.8;
        for (let u = 1; u < i; u++) {
            const lx = rodX + CW + u * CW;
            ctx.beginPath();
            ctx.moveTo(lx, ROD_Y);
            ctx.lineTo(lx, ROD_Y + ROD_H);
            ctx.stroke();
        }

        /* 잘린 위치 강조선 */
        const cutX = rodX + CW + j * CW;
        ctx.strokeStyle = C.cyan;
        ctx.lineWidth   = 2.5;
        ctx.beginPath();
        ctx.moveTo(cutX, ROD_Y - 6);
        ctx.lineTo(cutX, ROD_Y + ROD_H + 6);
        ctx.stroke();

        /* 조각 레이블 */
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const cutCenterX = rodX + CW + j * CW / 2;
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = C.white;
        ctx.fillText(`p[${j}]`, cutCenterX, ROD_Y + ROD_H / 2 - 8);
        ctx.font = '12px monospace';
        ctx.fillStyle = C.cyan;
        ctx.fillText(`= ${PRICES[j - 1]}`, cutCenterX, ROD_Y + ROD_H / 2 + 9);

        if (i - j > 0) {
            const remCenterX = rodX + CW + j * CW + (i - j) * CW / 2;
            ctx.font = 'bold 12px monospace';
            ctx.fillStyle = C.sub;
            ctx.fillText(`dp[${i - j}]`, remCenterX, ROD_Y + ROD_H / 2 - 8);
            ctx.font = '12px monospace';
            ctx.fillStyle = C.sub;
            ctx.fillText(`= ${dp[i - j]}`, remCenterX, ROD_Y + ROD_H / 2 + 9);
        }

        /* 길이 레이블 */
        ctx.font = '10px monospace';
        ctx.fillStyle = C.dim;
        ctx.fillText(`막대 길이 ${i}`, PX + HW / 2, ROD_Y + ROD_H / 2);
    }

    /* ── 우측 패널 ── */
    const ry0 = DP_Y;

    if (tried && tried.length > 0 && activeI !== null) {
        const maxCost = Math.max(...tried.map(t => t.cost));

        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = C.cyan;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`dp[${activeI}] 계산`, RX, ry0);

        ctx.font = '10px monospace';
        ctx.fillStyle = C.dim;
        ctx.fillText('j별 수익 탐색', RX, ry0 + 18);

        tried.forEach(({ j, cost }, idx) => {
            const ry     = ry0 + 42 + idx * 40;
            const isCurr = j === activeJ;
            const isBest = cost === maxCost;

            if (isCurr) {
                ctx.fillStyle = 'rgba(0,212,255,0.10)';
                ctx.fillRect(RX - 4, ry - 3, RW + 4, 34);
            }

            ctx.font = 'bold 13px monospace';
            ctx.fillStyle = isCurr ? C.white : (isBest ? C.gold : C.dim);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`j = ${j}`, RX, ry);

            ctx.font = '12px monospace';
            ctx.fillStyle = isCurr ? C.cyan : (isBest ? C.gold : '#354555');
            ctx.fillText(`→ ${cost}`, RX + 10, ry + 17);

            if (isBest && tried.length > 1) {
                ctx.fillStyle = C.gold;
                ctx.font = '10px monospace';
                ctx.fillText('★ max', RX + 88, ry + 1);
            }
        });

    } else if (isResult) {
        /* 최적 분할 정보 */
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = C.gold;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('최종 dp 테이블', RX, ry0);

        const finalVals = [
            ['dp[0]', '0'],
            ['dp[1]', '2'],
            ['dp[2]', '5'],
            ['dp[3]', '7'],
            ['dp[4]', '10'],
            ['dp[5]', '12  ★'],
        ];
        finalVals.forEach(([lbl, val], idx) => {
            const ry = ry0 + 25 + idx * 26;
            ctx.font = '11px monospace';
            ctx.fillStyle = idx === N ? C.gold : C.sub;
            ctx.fillText(`${lbl} = ${val}`, RX, ry);
        });
    }

    /* ── 설명 영역 ── */
    ctx.fillStyle = 'rgba(0,12,22,0.97)';
    ctx.fillRect(0, DESC_Y, W, H - DESC_Y);

    ctx.strokeStyle = 'rgba(0,212,255,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, DESC_Y); ctx.lineTo(W, DESC_Y); ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = isResult ? C.gold : C.cyan;
    ctx.fillText(desc, W / 2, DESC_Y + 22);

    if (subDesc) {
        ctx.font = '11px monospace';
        ctx.fillStyle = C.sub;
        ctx.fillText(subDesc, W / 2, DESC_Y + 46);
    }
}
