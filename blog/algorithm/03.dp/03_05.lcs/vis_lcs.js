/**
 * vis_lcs.js — 최장 공통 부분 수열(LCS) DP 테이블 캔버스 애니메이션
 *
 * 예제: X = "ABCD", Y = "ACDB" → LCS = "ACD" (길이 3)
 */

const X_ARR = ['A', 'B', 'C', 'D'];
const Y_ARR = ['A', 'C', 'D', 'B'];
const M = X_ARR.length; // 행 (X)
const N = Y_ARR.length; // 열 (Y)

/* ── 레이아웃 상수 (Canvas 700×455) ── */
const W = 700, H = 455;
const TX = 15, TY = 78;                       // 테이블 좌상단
const HW = 50, HH = 38;                       // 헤더 셀 크기
const CW = 72, CH = 56;                       // 데이터 셀 크기
const RX = TX + HW + (N + 1) * CW + 18;      // 우측 패널 X  (=443)
const RW = W - RX - 8;                        // 우측 패널 너비 (=249)
const DESC_Y = 400;                            // 설명 영역 Y

/* ── 색상 팔레트 ── */
const C = {
    bg:       '#050a10',
    empty:    'rgba(8,20,32,0.9)',
    zero:     'rgba(0,50,70,0.85)',
    done:     'rgba(0,40,65,0.9)',
    act:      'rgba(0,120,170,0.75)',
    res:      'rgba(100,65,0,0.55)',
    match:    'rgba(0,130,80,0.65)',    // 일치 셀
    refDiag:  'rgba(180,130,0,0.35)',   // 대각 참조 (일치)
    refSide:  'rgba(60,0,150,0.35)',    // 위/왼쪽 참조 (불일치)
    border:   'rgba(0,212,255,0.22)',
    bdrAct:   '#00d4ff',
    bdrRes:   '#ffd700',
    bdrMatch: '#00e898',
    bdrDiag:  '#c8a000',
    bdrSide:  '#8855ff',
    cyan:     '#00d4ff',
    gold:     '#ffd700',
    green:    '#00e898',
    purple:   '#aa88ff',
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
    /* (M+1) × (N+1) 테이블, 1-based 인덱스 사용 */
    const c = Array.from({ length: M + 1 }, () => Array(N + 1).fill(null));

    const snap = (active, isMatch, refs, desc, subDesc, isResult = false, lcsCells = []) =>
        frames.push({
            c: c.map(r => [...r]),
            active,
            isMatch,
            refs: refs.map(r => ({ ...r })),
            desc,
            subDesc,
            isResult,
            lcsCells: lcsCells.map(r => ({ ...r })),
        });

    /* Frame 0: 빈 테이블 */
    snap(null, null, [],
        'X = "ABCD"와 Y = "ACDB"의 LCS를 구합니다',
        'c[i][j] = X[1..i]와 Y[1..j]의 LCS 길이');

    /* Frame 1: 기저 조건 — 0번 행/열 = 0 */
    for (let i = 0; i <= M; i++) c[i][0] = 0;
    for (let j = 0; j <= N; j++) c[0][j] = 0;
    snap(null, null, [],
        '기저 조건: 어느 한쪽이 비어 있으면 LCS = 0',
        'c[i][0] = 0,  c[0][j] = 0  (모든 i, j)');

    /* 행 i, 열 j 순서로 채우기 */
    for (let i = 1; i <= M; i++) {
        for (let j = 1; j <= N; j++) {
            const xi = X_ARR[i - 1];
            const yj = Y_ARR[j - 1];

            if (xi === yj) {
                /* 일치: 대각선 + 1 */
                c[i][j] = c[i - 1][j - 1] + 1;
                snap(
                    { i, j }, true,
                    [{ i: i - 1, j: j - 1, type: 'diag' }],
                    `X[${i}]='${xi}' == Y[${j}]='${yj}'  →  일치!`,
                    `c[${i}][${j}] = c[${i-1}][${j-1}] + 1 = ${c[i-1][j-1]} + 1 = ${c[i][j]}`
                );
            } else {
                /* 불일치: max(위, 왼쪽) */
                c[i][j] = Math.max(c[i - 1][j], c[i][j - 1]);
                snap(
                    { i, j }, false,
                    [{ i: i - 1, j, type: 'above' }, { i, j: j - 1, type: 'left' }],
                    `X[${i}]='${xi}' ≠ Y[${j}]='${yj}'  →  불일치`,
                    `c[${i}][${j}] = max(c[${i-1}][${j}]=${c[i-1][j]}, c[${i}][${j-1}]=${c[i][j-1]}) = ${c[i][j]}`
                );
            }
        }
    }

    /* 역추적으로 LCS 경로 셀 계산 */
    const lcsCells = [];
    let ti = M, tj = N;
    while (ti > 0 && tj > 0) {
        if (X_ARR[ti - 1] === Y_ARR[tj - 1]) {
            lcsCells.push({ i: ti, j: tj });
            ti--; tj--;
        } else if (c[ti - 1][tj] >= c[ti][tj - 1]) {
            ti--;
        } else {
            tj--;
        }
    }

    /* 최종 결과 */
    snap(
        { i: M, j: N }, null, [],
        `LCS 길이: c[${M}][${N}] = ${c[M][N]}`,
        'LCS = "ACD"  (역추적: ★ 표시 셀)',
        true,
        lcsCells
    );

    return frames;
}

/* ════════════════════════════════════════════
   단일 프레임 렌더링
════════════════════════════════════════════ */
function drawFrame(ctx, frame) {
    const { c, active, isMatch, refs, desc, subDesc, isResult, lcsCells } = frame;

    /* 참조 셀 빠른 조회용 Set */
    const refSet  = new Set(refs.map(r => `${r.i},${r.j}`));
    const refType = Object.fromEntries(refs.map(r => [`${r.i},${r.j}`, r.type]));
    const lcsSet  = new Set(lcsCells.map(r => `${r.i},${r.j}`));

    /* 배경 */
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    /* 제목 */
    ctx.font = 'bold 15px Orbitron, monospace';
    ctx.fillStyle = C.cyan;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LCS DP 테이블  (X = "ABCD",  Y = "ACDB")', W / 2, 22);

    /* 수열 레이블 */
    ctx.font = '11px monospace';
    ctx.fillStyle = '#5a7888';
    ctx.fillText('부분 수열 — 순서 유지, 연속하지 않아도 됨', W / 2, 48);

    /* ── DP 테이블 ── */
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    /* 대각 헤더 */
    ctx.fillStyle = C.cyan;
    ctx.fillText('i\\j', TX + HW / 2, TY + HH / 2);

    /* 열 헤더 (Y 문자: j=0은 ε) */
    for (let j = 0; j <= N; j++) {
        const cx   = TX + HW + j * CW + CW / 2;
        const label = j === 0 ? 'ε' : Y_ARR[j - 1];
        ctx.fillStyle = j === 0 ? C.dim : '#a0d8ef';
        ctx.fillText(label, cx, TY + HH / 2);
    }

    /* 행 그리기 */
    for (let i = 0; i <= M; i++) {
        /* 행 헤더 (X 문자: i=0은 ε) */
        const rowLabel = i === 0 ? 'ε' : X_ARR[i - 1];
        ctx.fillStyle = i === 0 ? C.dim : '#a0d8ef';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rowLabel, TX + HW / 2, TY + HH + i * CH + CH / 2);

        /* 셀 */
        for (let j = 0; j <= N; j++) {
            const cx  = TX + HW + j * CW;
            const cy  = TY + HH + i * CH;
            const val = c[i][j];
            const key = `${i},${j}`;

            const isAct  = active  && active.i  === i && active.j  === j;
            const isRes  = isResult && i === M && j === N;
            const isLCS  = lcsSet.has(key);
            const isRef  = refSet.has(key);
            const rtype  = refType[key];

            /* 배경·테두리 결정 */
            let bg, stroke, glow = null;

            if (isRes) {
                bg = C.res;     stroke = C.bdrRes;   glow = C.gold;
            } else if (isLCS) {
                bg = 'rgba(255,180,0,0.22)'; stroke = C.bdrRes; glow = C.gold;
            } else if (isAct && isMatch) {
                bg = C.match;   stroke = C.bdrMatch; glow = C.green;
            } else if (isAct) {
                bg = C.act;     stroke = C.bdrAct;   glow = C.cyan;
            } else if (isRef && rtype === 'diag') {
                bg = C.refDiag; stroke = C.bdrDiag;
            } else if (isRef) {
                bg = C.refSide; stroke = C.bdrSide;
            } else if (val === 0) {
                bg = C.zero;    stroke = C.border;
            } else if (val !== null) {
                bg = C.done;    stroke = C.border;
            } else {
                bg = C.empty;   stroke = 'rgba(0,212,255,0.10)';
            }

            ctx.fillStyle = bg;
            ctx.fillRect(cx, cy, CW, CH);

            if (glow) {
                ctx.save();
                ctx.shadowColor = glow;
                ctx.shadowBlur  = 18;
                ctx.strokeStyle = stroke;
                ctx.lineWidth   = 2;
                ctx.strokeRect(cx + 1, cy + 1, CW - 2, CH - 2);
                ctx.restore();
            } else if (isRef) {
                ctx.strokeStyle = stroke;
                ctx.lineWidth   = 1.5;
                ctx.strokeRect(cx + 0.5, cy + 0.5, CW - 1, CH - 1);
            } else {
                ctx.strokeStyle = stroke;
                ctx.lineWidth   = 0.8;
                ctx.strokeRect(cx, cy, CW, CH);
            }

            /* 값 표시 */
            if (val !== null) {
                let color;
                if      (isRes || isLCS)      color = C.gold;
                else if (isAct && isMatch)    color = C.white;
                else if (isAct)               color = C.white;
                else if (isRef && rtype === 'diag') color = C.gold;
                else if (isRef)               color = C.purple;
                else if (val === 0)           color = C.sub;
                else                          color = C.cyan;

                ctx.font = 'bold 16px monospace';
                ctx.fillStyle = color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(val), cx + CW / 2, cy + CH / 2);

                /* LCS 역추적 셀 별표 */
                if (isLCS) {
                    ctx.font = '9px monospace';
                    ctx.fillStyle = C.gold;
                    ctx.fillText('★', cx + CW - 10, cy + 10);
                }
            }
        }
    }

    /* ── 우측 패널 ── */
    const ry0 = TY + 5;

    if (active !== null && isMatch !== null) {
        const xi = X_ARR[active.i - 1];
        const yj = Y_ARR[active.j - 1];

        /* 문자 비교 */
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = isMatch ? C.green : '#ff6060';
        ctx.fillText(`'${xi}' ${isMatch ? '==' : '≠'} '${yj}'`, RX, ry0);

        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = isMatch ? C.green : '#ff6060';
        ctx.fillText(isMatch ? '▶ 일치' : '▶ 불일치', RX, ry0 + 28);

        /* 구분선 */
        ctx.strokeStyle = 'rgba(0,212,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(RX, ry0 + 48);
        ctx.lineTo(RX + RW, ry0 + 48);
        ctx.stroke();

        if (isMatch) {
            /* 일치 공식 */
            const diagVal = c[active.i - 1][active.j - 1];
            const curVal  = c[active.i][active.j];

            ctx.font = '12px monospace';
            ctx.fillStyle = C.sub;
            ctx.textBaseline = 'top';
            ctx.fillText('c[i][j] =', RX, ry0 + 58);
            ctx.fillText('c[i-1][j-1] + 1', RX + 8, ry0 + 75);

            ctx.font = 'bold 13px monospace';
            ctx.fillStyle = C.gold;
            ctx.fillText(`= ${diagVal} + 1`, RX + 8, ry0 + 98);
            ctx.fillStyle = C.green;
            ctx.fillText(`= ${curVal}`, RX + 8, ry0 + 118);

            /* 참조 셀 레이블 */
            ctx.font = '10px monospace';
            ctx.fillStyle = C.bdrDiag;
            ctx.fillText(`↖ c[${active.i-1}][${active.j-1}] = ${diagVal}`, RX, ry0 + 148);

        } else {
            /* 불일치 공식 */
            const aboveVal = c[active.i - 1][active.j];
            const leftVal  = c[active.i][active.j - 1];
            const curVal   = c[active.i][active.j];

            ctx.font = '12px monospace';
            ctx.fillStyle = C.sub;
            ctx.textBaseline = 'top';
            ctx.fillText('c[i][j] = max(', RX, ry0 + 58);

            ctx.font = '12px monospace';
            ctx.fillStyle = C.purple;
            ctx.fillText(`  c[i-1][j]  = ${aboveVal}`, RX, ry0 + 76);
            ctx.fillText(`  c[i][j-1]  = ${leftVal}`, RX, ry0 + 94);

            ctx.font = '12px monospace';
            ctx.fillStyle = C.sub;
            ctx.fillText(')', RX, ry0 + 112);

            ctx.font = 'bold 14px monospace';
            ctx.fillStyle = C.cyan;
            ctx.fillText(`= ${curVal}`, RX, ry0 + 132);

            /* 참조 셀 레이블 */
            ctx.font = '10px monospace';
            ctx.fillStyle = C.bdrSide;
            ctx.fillText(`↑ c[${active.i-1}][${active.j}] = ${aboveVal}`, RX, ry0 + 162);
            ctx.fillText(`← c[${active.i}][${active.j-1}] = ${leftVal}`, RX, ry0 + 178);
        }

    } else if (isResult) {
        /* 결과 패널 */
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = C.gold;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('역추적 결과', RX, ry0);

        const lcsStr = lcsCells.slice().reverse().map(({ i }) => X_ARR[i - 1]).join('');
        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = C.gold;
        ctx.fillText(`"${lcsStr}"`, RX, ry0 + 22);

        ctx.font = '11px monospace';
        ctx.fillStyle = C.sub;
        ctx.fillText('★ 셀을 역순으로 따라가면', RX, ry0 + 55);
        ctx.fillText('LCS 문자열을 복원합니다', RX, ry0 + 72);

        /* 색상 범례 */
        const legends = [
            { color: C.bdrMatch, label: '일치 (대각 +1)' },
            { color: C.bdrSide,  label: '불일치 (max)' },
            { color: C.bdrDiag,  label: '대각 참조' },
            { color: C.gold,     label: 'LCS 역추적 경로' },
        ];
        ctx.font = '11px monospace';
        legends.forEach(({ color, label }, idx) => {
            const ly = ry0 + 100 + idx * 26;
            ctx.fillStyle = color;
            ctx.fillRect(RX, ly + 2, 10, 10);
            ctx.fillStyle = C.sub;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(label, RX + 15, ly);
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
    ctx.fillStyle = isResult ? C.gold : (isMatch === true ? C.green : (isMatch === false ? '#ff8888' : C.cyan));
    ctx.fillText(desc, W / 2, DESC_Y + 22);

    if (subDesc) {
        ctx.font = '11px monospace';
        ctx.fillStyle = C.sub;
        ctx.fillText(subDesc, W / 2, DESC_Y + 46);
    }
}
