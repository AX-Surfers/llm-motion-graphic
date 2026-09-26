/* 7(초보자). 문맥 읽기 — 트랜스포머·어텐션을 비유 하나로
   ① 문장을 통째로 한 번에 본다  ② 주변 단어를 보고 '눈'의 뜻을 정한다  ③ 같은 '눈'도 문맥 따라 달라진다 */
(() => {
  const L = MG.lib, C = L.C;
  const S1 = ['밖에', '눈이', '많이', '내린다'], S1A = [[3, 1.0], [0, 0.6]];
  const S2 = ['여기', '보는', '눈이', '많다'], S2A = [[1, 1.0], [3, 0.4]];
  const FS = 50, TY = 400;

  function snowflake(x, y, r, col, a) {
    for (let k = 0; k < 3; k++) {
      const t = (k * Math.PI) / 3;
      const dx = Math.cos(t) * r, dy = Math.sin(t) * r;
      L.line(x - dx, y - dy, x + dx, y + dy, { color: col, lw: 3, alpha: a });
      for (const sgn of [-1, 1]) {
        const bx = x + sgn * dx * 0.55, by = y + sgn * dy * 0.55;
        for (const w of [-1, 1]) {
          const tt = t + w * 0.7;
          L.line(bx, by, bx + sgn * Math.cos(tt) * r * 0.35, by + sgn * Math.sin(tt) * r * 0.35, { color: col, lw: 2.5, alpha: a });
        }
      }
    }
  }
  function eye(x, y, r, col, a) {
    L.pathLine((t) => [x - r + 2 * r * t, y - Math.sin(Math.PI * t) * r * 0.62], 0, 1, { color: col, lw: 3, alpha: a, n: 24 });
    L.pathLine((t) => [x - r + 2 * r * t, y + Math.sin(Math.PI * t) * r * 0.62], 0, 1, { color: col, lw: 3, alpha: a, n: 24 });
    L.circle(x, y, r * 0.36, { stroke: col, lw: 3, alpha: a });
    L.circle(x, y, r * 0.14, { fill: col, alpha: a });
  }
  // 문장 하나 그리기: 가운데 cx, 배율 sc
  function sentence(words, cx, y, sc, a, focus, arcs, pArc, pMean, col, label, icon, T) {
    const lay = L.layoutTiles(words, cx, { size: FS * sc, gap: 16 * sc, align: 'center' });
    lay.forEach((ps, i) => {
      const isF = i === focus;
      L.tile(words[i], ps.x, y, {
        size: FS * sc, alpha: a, color: C.white,
        stroke: isF ? L.mix('#5E5E5E', col, Math.max(0.35, pMean)) : C.grey2,
        glow: isF && pMean > 0.5 ? L.rgba(col, 0.45) : null,
      });
    });
    const top = y - FS * sc * 0.8;
    arcs.forEach(([src, wgt], j) => {
      const x1 = lay[src].x, x2 = lay[focus].x;
      const h = (60 + Math.abs(x2 - x1) * 0.35) * sc;
      const f = L.qbez(x1, top, (x1 + x2) / 2, top - h * 2, x2, top);
      const g = L.ease(L.sub(pArc, j * 0.15, 0.55 + j * 0.15));
      const pulse = 0.6 + 0.4 * Math.sin(T * 5 + j * 1.9);
      L.pathLine(f, 0, g, { color: col, lw: (3 + 7 * wgt) * sc, alpha: a * (0.4 + 0.6 * wgt) * (g >= 1 ? pulse : 1), head: 16 * sc, glow: col, blur: 14 });
    });
    // 뜻 카드
    if (pMean > 0) {
      const fx = lay[focus].x, cy = y + 150 * sc, e = L.ease(pMean);
      L.arrow(fx, y + FS * sc * 0.85, fx, cy - 58 * sc, e, { color: col, lw: 3, head: 14, alpha: a });
      const w = (L.tw(label, { size: 34 * sc, weight: 700 }) + 130 * sc), h = 96 * sc;
      L.rect(fx - w / 2, cy - h / 2 + 8 * sc, w, h, { fill: L.rgba(col, 0.1), stroke: col, lw: 2.5, r: 18 * sc, alpha: a * e, glow: L.rgba(col, 0.3) });
      icon(fx - w / 2 + 52 * sc, cy + 8 * sc, 26 * sc, col, a * e);
      L.text(label, fx - w / 2 + 96 * sc, cy + 10 * sc, { size: 34 * sc, weight: 700, color: C.white, alpha: a * e });
    }
  }

  MG.scene({
    id: 'context-basic', only: 'basic', title: ['7', '문맥 읽기'],
    steps: [
      { d: 4.2, n: '문장을 통째로 한 번에 본다' },
      { d: 4.6, n: '주변 단어를 보고 뜻을 정한다' },
      { d: 4.8, n: '같은 눈, 다른 뜻' },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = L.st(S, 3);

      // ---- 1. 문장 전체를 한 번에 ----
      const move = L.ease(L.sub(p3, 0, 0.35));
      const cx1 = L.lerp(960, 510, move), sc1 = L.lerp(1, 0.78, move);
      const a1 = L.ease(L.sub(p1, 0, 0.25));
      // 레이어(한 번에 처리)
      const la = L.ease(L.sub(p1, 0.25, 0.45)) * (1 - L.ease(L.sub(p2, 0, 0.25)));
      if (la > 0) {
        const lay = L.layoutTiles(S1, 960, { size: FS, gap: 16, align: 'center' });
        const x0 = lay[0].x - lay[0].w / 2 - 30, x1 = lay[3].x + lay[3].w / 2 + 30;
        const q = L.sub(p1, 0.4, 0.75);
        const lit = Math.sin(Math.PI * L.sub(q, 0.3, 1));
        lay.forEach((ps) => L.arrow(ps.x, TY + 44, ps.x, 590, L.ease(L.sub(q, 0, 0.4)), { color: C.blue, lw: 4, head: 14, alpha: la }));
        L.rect(x0, 600, x1 - x0, 76, { fill: L.mix('#161616', C.blue, 0.15 + 0.45 * lit), stroke: C.blue, lw: 2.5, r: 16, alpha: la, glow: lit > 0.3 ? L.rgba(C.blue, 0.5 * lit) : null });
        L.text('LLM', 960, 640, { size: 34, font: 'serif', color: C.white, align: 'center', alpha: la });
        L.text('한 단어씩 차례로가 아니라, 네 단어를 동시에', 960, 745, { size: 30, weight: 600, color: C.dim, align: 'center', alpha: la * L.ease(L.sub(p1, 0.7, 0.9)) });
      }

      // ---- 2. 주변 단어 → '눈'의 뜻 ----
      sentence(S1, cx1, L.lerp(TY, 420, move), sc1, a1, 1, S1A, L.sub(p2, 0.15, 0.7), L.sub(p2, 0.65, 0.9), C.blue, '하늘에서 내리는 눈', snowflake, T);

      // ---- 3. 같은 '눈', 다른 문장 ----
      const a2 = L.ease(L.sub(p3, 0.25, 0.45));
      if (a2 > 0) {
        L.line(960, 250, 960, 820, { color: C.grey3, lw: 2, alpha: a2 });
        sentence(S2, 1410, 420, 0.78, a2, 2, S2A, L.sub(p3, 0.4, 0.8), L.sub(p3, 0.75, 0.95), C.pink, '사람의 눈 · 시선', eye, T);
      }

      L.caption('LLM은 문장을 한 단어씩이 아니라 {b|통째로 한 번에} 본다 (트랜스포머)', L.vis(S, 1, 2, 0.45, 0.65, 0, 0.15));
      L.caption('\'내린다\', \'밖에\'를 보고 → 이 \'눈\'은 {b|하늘에서 내리는 눈}', L.vis(S, 2, 3, 0.4, 0.6, 0, 0.15));
      L.caption('같은 \'눈\'도 {y|주변 단어(문맥)}를 보고 뜻이 정해진다 — 이것이 {b|어텐션}', L.vis(S, 3, undefined, 0.4, 0.6));
    },
  });
})();
