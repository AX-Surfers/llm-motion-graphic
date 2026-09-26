/* 8. 어텐션 — 단어는 주변 문맥을 보고 의미를 다시 조정한다 */
(() => {
  const L = MG.lib, C = L.C;
  const VEC = [0.31, -0.84, 1.07, 0.12, -0.46, 0.73, -1.18, 0.05];
  // 의미 공간
  const PL = { x0: 1010, y0: 175, x1: 1830, y1: 890 };
  const O = [1420, 845];
  const WEATHER = [['비', 1120, 350], ['눈송이', 1222, 272], ['겨울', 1075, 445], ['내리다', 1225, 420]];
  const EYE = [['눈동자', 1610, 272], ['시선', 1715, 350], ['보다', 1600, 420], ['얼굴', 1750, 445]];
  const T0 = [1420, 380], TS = [1175, 365], TE = [1665, 365]; // 모호한 눈 / 날씨 눈 / 신체 눈
  // 문장
  const S1 = ['밖에', '눈', '이', '많이', '내린다'], S1Y = 420, S1A = [[4, 1.0], [0, 0.65], [3, 0.3]];
  const S2 = ['여기', '보는', '눈', '이', '많다'], S2Y = 770, S2A = [[1, 1.0], [4, 0.45], [0, 0.3]];
  const FS = 38, SX = 100;
  let lay1 = null, lay2 = null;

  const polar = (p) => [Math.atan2(p[1] - O[1], p[0] - O[0]), Math.hypot(p[0] - O[0], p[1] - O[1])];
  function vecArrow(from, to, t, o) {
    const [a0, r0] = polar(from), [a1, r1] = polar(to);
    const a = L.lerp(a0, a1, t), r = L.lerp(r0, r1, t);
    const tip = [O[0] + Math.cos(a) * r, O[1] + Math.sin(a) * r];
    L.arrow(O[0], O[1], tip[0], tip[1], o.grow === undefined ? 1 : o.grow, { color: o.color, lw: o.lw || 5, head: 22, alpha: o.alpha, glow: o.glow });
    return tip;
  }
  // 토큰 아래 작은 벡터(색 띠)
  function strip(x, y, seed, a, shift, shiftCol) {
    for (let k = 0; k < 5; k++) {
      let v = (L.rnd(seed * 11 + k * 3.7) - 0.5) * 2;
      if (shift) v = L.lerp(v, shiftCol[k], shift);
      const col = v >= 0 ? C.blue : C.red;
      L.rect(x - 16, y + k * 17, 32, 14, { fill: L.rgba(col, 0.15 + 0.75 * Math.abs(v)), r: 2, alpha: a });
    }
  }
  const SNOW_V = [0.9, 0.7, -0.2, 0.8, 0.4], EYE_V = [-0.7, 0.2, 0.9, -0.5, -0.9];

  function sentence(words, y, lay, a, focus, arcs, pArc, pShift, shiftV, color, T) {
    lay.forEach((ps, i) => {
      const isF = i === focus;
      L.tile(words[i], ps.x, y, { size: FS, alpha: a, stroke: isF ? L.mix('#5E5E5E', color, 0.4 + 0.6 * pShift) : C.grey2, color: isF ? C.white : C.text, glow: isF && pShift > 0.5 ? L.rgba(color, 0.4) : null });
      strip(ps.x, y + 40, i + (words === S1 ? 0 : 20), a, isF ? pShift : 0, shiftV);
    });
    arcs.forEach(([src, wgt], j) => {
      const x1 = lay[src].x, x2 = lay[focus].x, top = y - 34;
      const h = 50 + Math.abs(x2 - x1) * 0.28;
      const f = L.qbez(x1, top, (x1 + x2) / 2, top - h * 2, x2, top);
      const g = L.ease(L.sub(pArc, j * 0.12, 0.45 + j * 0.12));
      const pulse = 0.55 + 0.45 * Math.sin(T * 5 + j * 1.7);
      const on = L.sub(pArc, 0.45, 0.6) * (1 - L.sub(pShift, 0.6, 1) * 0.5);
      L.pathLine(f, 0, g, { color: color, lw: 2 + 7 * wgt, alpha: a * (0.35 + 0.65 * wgt) * L.lerp(1, pulse, on), head: 14, glow: color, blur: 12 });
    });
  }

  MG.scene({
    id: 'attention', only: 'full', title: ['8', '어텐션: 문맥 읽기'],
    steps: [
      { d: 3.4, n: '단어 → 숫자 목록(벡터)' },
      { d: 3.8, n: '의미 공간: 비슷한 뜻 = 비슷한 방향' },
      { d: 4.8, n: '밖에 눈이 많이 내린다' },
      { d: 4.8, n: '여기 보는 눈이 많다' },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = L.st(S, 3), p4 = L.st(S, 4);
      if (!lay1) { lay1 = L.layoutTiles(S1, SX, { size: FS, gap: 14 }); lay2 = L.layoutTiles(S2, SX, { size: FS, gap: 14 }); }

      // ---- 1. 단어 → 벡터 ----
      const mv = L.ease(L.sub(p2, 0, 0.45));
      const aV = L.ease(L.sub(p1, 0, 0.15)) * (1 - L.ease(L.sub(p3, 0, 0.2)));
      if (aV > 0) {
        const tx = L.lerp(960, 330, mv), ty = L.lerp(290, 250, mv), sc = L.lerp(1, 0.8, mv);
        L.tile('눈', tx, ty, { size: 70 * sc, alpha: aV, stroke: C.grey, color: C.white });
        const vx = L.lerp(960, 330, mv), vy = L.lerp(660, 600, mv);
        L.arrow(tx, ty + 60 * sc, tx, vy - 230 * sc, L.ease(L.sub(p1, 0.15, 0.4)), { color: C.grey, lw: 3, alpha: aV });
        L.vecCol(vx, vy, [...VEC, '⋮'], L.sub(p1, 0.3, 1), { size: 30 * sc, alpha: aV, colors: [...VEC.map((v) => (v >= 0 ? C.blue : C.red)), C.grey] });
        const la = aV * L.ease(L.sub(p1, 0.6, 0.85)) * (1 - mv);
        L.text('숫자 목록 = 벡터', vx + 150, vy - 20, { size: 32, weight: 600, color: C.white, alpha: la });
        L.text('(임베딩 · 실제로는 수천~수만 개의 숫자)', vx + 150, vy + 26, { size: 24, color: C.grey, alpha: la });
      }

      // ---- 2. 의미 공간 ----
      const pa = L.ease(L.sub(p2, 0.2, 0.5));
      if (pa > 0) {
        for (let x = PL.x0; x <= PL.x1 + 1; x += 60) L.line(x, PL.y0, x, PL.y1, { color: '#FFFFFF', lw: 1, alpha: pa * 0.07 });
        for (let y = PL.y1; y >= PL.y0 - 1; y -= 60) L.line(PL.x0, y, PL.x1, y, { color: '#FFFFFF', lw: 1, alpha: pa * 0.07 });
        L.line(PL.x0, O[1], PL.x1, O[1], { color: C.grey2, lw: 2, alpha: pa });
        L.line(O[0], PL.y0, O[0], PL.y1, { color: C.grey2, lw: 2, alpha: pa });
        L.text('의미 공간', PL.x0, PL.y0 - 34, { size: 28, weight: 700, color: C.dim, alpha: pa });
        const dot = (lab, x, y, col, i) => {
          const a = pa * L.ease(L.sub(p2, 0.35 + i * 0.04, 0.55 + i * 0.04));
          L.circle(x, y, 7, { fill: col, alpha: a });
          L.text(lab, x, y - 26, { size: 26, weight: 600, color: col, align: 'center', alpha: a });
        };
        WEATHER.forEach(([l, x, y], i) => dot(l, x, y, C.blue, i));
        EYE.forEach(([l, x, y], i) => dot(l, x, y, C.pink, i + 4));
        L.text('날씨', 1150, 520, { size: 24, color: C.blue, align: 'center', alpha: pa * 0.6 * L.sub(p2, 0.6, 0.8) });
        L.text('신체 · 보기', 1690, 520, { size: 24, color: C.pink, align: 'center', alpha: pa * 0.6 * L.sub(p2, 0.6, 0.8) });
        // 모호한 '눈' 벡터
        const g = L.ease(L.sub(p2, 0.55, 0.85));
        const ghost = p3 > 0.5;
        const tip = vecArrow(T0, T0, 0, { color: ghost ? C.grey2 : C.white, grow: g, alpha: pa * (ghost ? 0.6 : 1) });
        L.text('눈 ?', tip[0] + 16, tip[1] - 10, { size: 32, weight: 700, color: ghost ? C.grey : C.white, alpha: pa * L.sub(p2, 0.8, 0.95) * (ghost ? 0.7 : 1) });
        // 두 개의 조정된 벡터
        const r1 = L.ease(L.sub(p3, 0.62, 0.92));
        if (p3 > 0.6) {
          const t1 = vecArrow(T0, TS, r1, { color: C.blue, alpha: pa, glow: C.blue });
          L.text('눈 = 하늘에서 내리는 눈', 1262, 640, { size: 28, weight: 700, color: C.blue, align: 'right', alpha: L.ease(L.sub(p3, 0.88, 1)) });
        }
        const r2 = L.ease(L.sub(p4, 0.62, 0.92));
        if (p4 > 0.6) {
          const t2 = vecArrow(T0, TE, r2, { color: C.pink, alpha: pa, glow: C.pink });
          L.text('눈 = 사람의 눈 · 시선', 1578, 640, { size: 28, weight: 700, color: C.pink, align: 'left', alpha: L.ease(L.sub(p4, 0.88, 1)) });
        }
      }

      // ---- 3·4. 문장 속 어텐션 ----
      const a1 = L.ease(L.sub(p3, 0.12, 0.3));
      if (a1 > 0) {
        L.text('문장 ①', SX, S1Y - 170, { size: 24, color: C.grey, alpha: a1 });
        sentence(S1, S1Y, lay1, a1, 1, S1A.map(([s, w]) => [s, w]), L.sub(p3, 0.25, 0.8), L.ease(L.sub(p3, 0.62, 0.9)), SNOW_V, C.blue, T);
      }
      const a2 = L.ease(L.sub(p4, 0.05, 0.25));
      if (a2 > 0) {
        L.text('문장 ②', SX, S2Y - 170, { size: 24, color: C.grey, alpha: a2 });
        sentence(S2, S2Y, lay2, a2, 2, S2A.map(([s, w]) => [s, w]), L.sub(p4, 0.2, 0.8), L.ease(L.sub(p4, 0.62, 0.9)), EYE_V, C.pink, T);
      }

      L.caption('단어는 컴퓨터가 계산할 수 있는 {b|숫자 목록(벡터)}으로 바뀐다', L.vis(S, 1, 2, 0.5, 0.75, 0, 0.15));
      L.caption('뜻이 비슷한 단어 = {b|비슷한 방향} — 그런데 \'눈\'은 어느 쪽일까?', L.vis(S, 2, 3, 0.4, 0.6, 0, 0.15));
      L.caption('주변 단어가 \'눈\'에게 정보를 보내 → {y|의미를 조정} (어텐션)', L.vis(S, 3, 4, 0.3, 0.5, 0, 0.15));
      L.caption('같은 \'눈\'도 {y|문맥}에 따라 전혀 다른 뜻이 된다', L.vis(S, 4, undefined, 0.3, 0.5));
    },
  });
})();
