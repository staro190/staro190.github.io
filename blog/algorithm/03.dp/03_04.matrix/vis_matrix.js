/**
 * vis_matrix.js — 행렬 연쇄 곱셈 DP 테이블 캔버스 애니메이션
 *
 * blog.js의 canvasVis 메타 필드로 불러오며,
 * .slideshow-container 요소를 캔버스 UI로 교체합니다.
 */

const P = [30, 35, 15, 5, 10]; // A1(30×35), A2(35×15), A3(15×5), A4(5×10)
const N = P.length - 1;        // 행렬 개수 = 4

/* ── 레이아웃 상수 (Canvas 700×440) ── */
const W = 700, H = 440;
const TX = 20, TY = 80;                       // 테이블 좌상단
const HW = 50, HH = 35;                       // 헤더 셀 크기
const CW = 72, CH = 58;                       // 데이터 셀 크기
const RX = TX + HW + N * CW + 22;            // 우측 패널 X
const RW = W - RX - 10;                       // 우측 패널 너비
const DESC_Y = 365;                            // 설명 영역 Y

/* ── 색상 팔레트 ── */
const C = {
    bg:       '#050a10',
    empty:    'rgba(8,20,32,0.9)',
    zero:     'rgba(0,50,70,0.85)',
    done:     'rgba(0,40,65,0.9)',
    act:      'rgba(0,120,170,0.75)',
    low:      'rgba(3,8,12,0.6)',
    res:      'rgba(100,65,0,0.55)',
    border:   'rgba(0,212,255,0.22)',
    bdrAct:   '#00d4ff',
    bdrRes:   '#ffd700',
    cyan:     '#00d4ff',
    gold:     '#ffd700',
    white:    '#e8e8e8',
    dim:      '#3a5060',
    sub:      '#90b0c0',
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
    /* 1-based 인덱스를 위해 (N+2) 크기로 초기화 */
    const m = Array.from({ length: N + 2 }, () => Array(N + 2).fill(null));

    const snap = (active, activeK, candidates, desc, subDesc, isResult = false) =>
        frames.push({
            m: m.map(r => [...r]),
            active,
            activeK,
            candidates: candidates.map(c => ({ ...c })),
            desc,
            subDesc,
            isResult,
        });

    /* Frame 0: 빈 테이블 */
    snap(null, null, [],
        '행렬 A₁~A₄를 최소 연산으로 곱하는 괄호 순서를 구합니다',
        'm[i][j] = Aᵢ~Aⱼ를 곱하는 최소 스칼라 곱셈 횟수');

    /* Frame 1: 기저 조건 m[i][i] = 0 */
    for (let i = 1; i <= N; i++) m[i][i] = 0;
    snap(null, null, [],
        '기저 조건: 행렬 하나만 있으면 곱셈이 필요 없습니다',
        'm[i][i] = 0  (i = 1, 2, 3, 4)');

    /* 체인 길이 l = 2 ~ N */
    for (let l = 2; l <= N; l++) {
        for (let i = 1; i <= N - l + 1; i++) {
            const j = i + l - 1;
            let best = Infinity;
            const tried = [];

            for (let k = i; k < j; k++) {
                const mk    = m[i][k];
                const mk1   = m[k + 1][j];
                const extra = P[i - 1] * P[k] * P[j];
                const cost  = mk + mk1 + extra;

                if (cost < best) best = cost;
                m[i][j] = best;
                tried.push({ k, cost });

                snap(
                    { i, j },
                    k,
                    tried,
                    `체인 길이 ${l} — m[${i}][${j}] 계산 중  (k = ${k})`,
                    `m[${i}][${k}](=${mk}) + m[${k+1}][${j}](=${mk1}) + ${P[i-1]}×${P[k]}×${P[j]}(=${extra}) = ${cost}`
                );
            }
        }
    }

    /* 최종 결과 */
    snap(
        { i: 1, j: N }, null, [],
        `최소 스칼라 곱셈 횟수: m[1][4] = ${m[1][N]}회`,
        '최적 괄호 순서:  ( ( A₁ · ( A₂ · A₃ ) ) · A₄ )',
        true
    );

    return frames;
}

/* ════════════════════════════════════════════
   단일 프레임 렌더링
════════════════════════════════════════════ */
function drawFrame(ctx, frame) {
    const { m, active, activeK, candidates, desc, subDesc, isResult } = frame;

    /* 배경 */
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    /* 제목 */
    ctx.font = 'bold 15px Orbitron, monospace';
    ctx.fillStyle = C.cyan;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('행렬 연쇄 곱셈 DP 테이블', W / 2, 22);

    /* 행렬 크기 레이블 */
    const matLabels = Array.from({ length: N }, (_, i) =>
        `A${i + 1}(${P[i]}×${P[i + 1]})`).join('   ');
    ctx.font = '11px monospace';
    ctx.fillStyle = '#5a7888';
    ctx.fillText(matLabels, W / 2, 48);

    /* ── DP 테이블 ── */
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    /* 헤더 */
    ctx.fillStyle = C.cyan;
    ctx.fillText('i\\j', TX + HW / 2, TY + HH / 2);
    for (let j = 1; j <= N; j++)
        ctx.fillText(String(j), TX + HW + (j - 1) * CW + CW / 2, TY + HH / 2);

    /* 셀 */
    for (let i = 1; i <= N; i++) {
        ctx.fillStyle = C.cyan;
        ctx.fillText(String(i), TX + HW / 2, TY + HH + (i - 1) * CH + CH / 2);

        for (let j = 1; j <= N; j++) {
            const cx  = TX + HW + (j - 1) * CW;
            const cy  = TY + HH + (i - 1) * CH;
            const val = m[i][j];
            const isAct = active && active.i === i && active.j === j;
            const isRes = isResult && i === 1 && j === N;

            /* 배경·테두리 결정 */
            let bg, stroke, glow = null;
            if      (i > j)    { bg = C.low;   stroke = 'rgba(0,80,100,0.08)'; }
            else if (isRes)    { bg = C.res;   stroke = C.bdrRes; glow = C.gold; }
            else if (isAct)    { bg = C.act;   stroke = C.bdrAct; glow = C.cyan; }
            else if (val === 0){ bg = C.zero;  stroke = C.border; }
            else if (val !== null){ bg = C.done; stroke = C.border; }
            else               { bg = C.empty; stroke = 'rgba(0,212,255,0.10)'; }

            ctx.fillStyle = bg;
            ctx.fillRect(cx, cy, CW, CH);

            if (glow) {
                ctx.save();
                ctx.shadowColor = glow;
                ctx.shadowBlur  = 20;
                ctx.strokeStyle = stroke;
                ctx.lineWidth   = 2;
                ctx.strokeRect(cx + 1, cy + 1, CW - 2, CH - 2);
                ctx.restore();
            } else {
                ctx.strokeStyle = stroke;
                ctx.lineWidth   = 0.8;
                ctx.strokeRect(cx, cy, CW, CH);
            }

            /* 값 표시 */
            if (val !== null && i <= j) {
                let txt, color, font;
                if (val === Infinity) {
                    txt = '∞'; color = C.dim; font = '18px monospace';
                } else {
                    txt   = val >= 10000 ? (val / 1000).toFixed(1) + 'k' : String(val);
                    font  = val >= 10000 ? '11px monospace' : '13px monospace';
                    color = isRes ? C.gold
                          : isAct ? C.white
                          : val === 0 ? C.sub
                          : C.cyan;
                }
                ctx.font = font;
                ctx.fillStyle = color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(txt, cx + CW / 2, cy + CH / 2);
            }
        }
    }

    /* ── 우측 패널 ── */
    const ry0 = TY + 5;

    if (candidates && candidates.length > 0 && active) {
        /* k 후보 목록 */
        const minCost = Math.min(...candidates.map(c => c.cost));

        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = C.cyan;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`m[${active.i}][${active.j}] 계산`, RX, ry0);

        ctx.font = '10px monospace';
        ctx.fillStyle = C.dim;
        ctx.fillText('k별 비용 탐색', RX, ry0 + 18);

        candidates.forEach(({ k, cost }, idx) => {
            const ry      = ry0 + 42 + idx * 44;
            const isCurr  = k === activeK;
            const isBest  = cost === minCost;

            if (isCurr) {
                ctx.fillStyle = 'rgba(0,212,255,0.10)';
                ctx.fillRect(RX - 4, ry - 3, RW + 4, 38);
            }

            ctx.font = 'bold 13px monospace';
            ctx.fillStyle = isCurr ? C.white : (isBest ? C.gold : C.dim);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`k = ${k}`, RX, ry);

            ctx.font = '12px monospace';
            ctx.fillStyle = isCurr ? C.cyan : (isBest ? C.gold : '#354555');
            ctx.fillText(`→ ${cost}`, RX + 10, ry + 18);

            if (isBest && candidates.length > 1) {
                ctx.fillStyle = C.gold;
                ctx.font = '10px monospace';
                ctx.fillText('★ min', RX + 90, ry + 2);
            }
        });

    } else if (isResult) {
        /* 최적 분할 표 */
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = C.gold;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('최적 분할 위치 k*', RX, ry0);

        const splits = [
            ['m[1][4]', 'k* = 3', '→ A₁₋₃ × A₄'],
            ['m[1][3]', 'k* = 1', '→ A₁ × A₂₋₃'],
            ['m[2][4]', 'k* = 3', '→ A₂₋₃ × A₄'],
        ];
        splits.forEach(([lbl, k, arrow], idx) => {
            const ry = ry0 + 28 + idx * 52;
            ctx.font = 'bold 11px monospace';
            ctx.fillStyle = C.sub;
            ctx.fillText(lbl, RX, ry);
            ctx.font = '13px monospace';
            ctx.fillStyle = C.gold;
            ctx.fillText(k, RX, ry + 17);
            ctx.font = '10px monospace';
            ctx.fillStyle = C.dim;
            ctx.fillText(arrow, RX, ry + 33);
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
