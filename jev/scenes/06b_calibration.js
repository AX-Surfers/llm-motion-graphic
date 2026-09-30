/* (공학) 보정(Calibration) — 0.8이라고 한 것들은 실제로 80% 맞아야 한다 */
(() => {
  const L = MG.lib, C = L.C, J = window.JV;
  const GX = 170, GY = 300, GS = 50, N = 10;
  // 100칸 중 틀린 20칸 (결정적)
  const order = [...Array(100).keys()].sort((a, b) => L.rnd(a + 7) - L.rnd(b + 7));
  const wrong = new Set(order.slice(0, 20));
  const PICK = order.slice(0, 20).find((i) => i % N === N - 1) ?? order[3]; // 3단계에서 가리킬 '틀린 한 건'
  const DX0 = 1060, DY0 = 790, DW = 620, DH = 520;
  const PX = (v) => DX0 + DW * v, PY = (v) => DY0 - DH * v;
  const GOOD = [[0.1, 0.12], [0.3, 0.28], [0.5, 0.53], [0.7, 0.68], [0.9, 0.91]];
  const OVER = [[0.1, 0.1], [0.3, 0.22], [0.5, 0.36], [0.7, 0.47], [0.9, 0.58]];

  MG.scene({
    id: 'calibration', only: 'full', title: ['9', '보정 — 확률을 믿을 수 있게'],
    steps: [
      { d: 5.0, n: '0.8이라고 한 100건 → 80건 맞음' },
      { d: 5.0, n: '신뢰도 도표: 대각선 위 = 잘 보정됨' },
      { d: 4.2, n: '묶음의 비율이지, 한 건의 보장은 아님' },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = L.st(S, 3);

      // ---- 1: 점 격자 ----
      const a1 = L.ease(L.sub(p1, 0, 0.2));
      L.rich('Jev가 “{y|0.8}”이라고 답한 {w|100건}', GX + (N * GS) / 2, 240, { size: 32, align: 'center', alpha: a1 });
      const fill = L.sub(p1, 0.2, 0.8);
      let ok = 0;
      for (let i = 0; i < 100; i++) {
        const r = Math.floor(i / N), c = i % N;
        const x = GX + c * GS + GS / 2, y = GY + r * GS + GS / 2;
        const shown = fill * 100 > order.indexOf(i);
        const col = shown ? (wrong.has(i) ? C.red : C.green) : C.grey3;
        if (shown && !wrong.has(i)) ok++;
        const pick = i === PICK ? L.ease(L.sub(p3, 0.2, 0.5)) : 0;
        L.circle(x, y, 16 + pick * 6, { fill: col, alpha: a1 * (1 - L.ease(L.sub(p3, 0.2, 0.5)) * (i === PICK ? 0 : 0.6)), glow: pick > 0 ? L.rgba(C.red, 0.8) : null });
      }
      L.rich(`맞은 것 {g|${ok}} / 100`, GX + (N * GS) / 2, GY + N * GS + 50, { size: 34, align: 'center', alpha: a1 * L.ease(L.sub(p1, 0.25, 0.4)) });

      // ---- 2: 신뢰도 도표 ----
      const a2 = L.ease(L.sub(p2, 0, 0.2));
      if (a2 > 0.003) {
        L.line(DX0, DY0, DX0 + DW, DY0, { color: C.grey, lw: 2, alpha: a2 });
        L.line(DX0, DY0, DX0, DY0 - DH, { color: C.grey, lw: 2, alpha: a2 });
        L.text('모델이 말한 확률', DX0 + DW / 2, DY0 + 50, { size: 24, color: C.dim, align: 'center', alpha: a2 });
        L.text('실제로 맞은 비율', DX0 - 20, DY0 - DH - 30, { size: 24, color: C.dim, alpha: a2 });
        ['0', '0.5', '1'].forEach((t, i) => {
          L.text(t, PX(i / 2), DY0 + 22, { size: 22, font: 'serif', color: C.grey, align: 'center', alpha: a2 });
          if (i) L.text(t, DX0 - 14, PY(i / 2), { size: 22, font: 'serif', color: C.grey, align: 'right', alpha: a2 });
        });
        const dg = L.ease(L.sub(p2, 0.1, 0.35));
        L.line(PX(0), PY(0), PX(dg), PY(dg), { color: C.white, lw: 2, dash: [8, 8], alpha: a2 * 0.7 });
        L.text('완벽한 보정', PX(0.27), PY(0.42), { size: 22, color: C.white, align: 'right', alpha: a2 * L.ease(L.sub(p2, 0.3, 0.45)) });
        const draw = (pts, col, q, lab, ly) => {
          if (q <= 0) return;
          const f = (t) => { const u = t * (pts.length - 1), k = Math.min(pts.length - 2, Math.floor(u)), r = u - k; return [PX(L.lerp(pts[k][0], pts[k + 1][0], r)), PY(L.lerp(pts[k][1], pts[k + 1][1], r))]; };
          L.pathLine(f, 0, L.ease(q), { color: col, lw: 3, alpha: a2 });
          pts.forEach((pt, i) => { if (L.ease(q) * (pts.length - 1) >= i - 0.01) L.circle(PX(pt[0]), PY(pt[1]), 9, { fill: col, alpha: a2 }); });
          L.text(lab, PX(0.93) + 16, PY(ly), { size: 26, weight: 700, color: col, align: 'left', alpha: a2 * L.ease(L.sub(q, 0.8, 1)) });
        };
        draw(GOOD, C.yellow, L.sub(p2, 0.35, 0.65), 'Jev (RLCD)', 0.91);
        draw(OVER, C.red, L.sub(p2, 0.6, 0.9), '과신하는 모델', 0.58);
        // 0.8 → 80% 표시
        const ma = a2 * L.ease(L.sub(p2, 0.5, 0.65));
        L.line(PX(0.8), DY0, PX(0.8), PY(0.8), { color: L.rgba(C.green, 0.7), lw: 1.5, dash: [4, 6], alpha: ma });
        L.line(DX0, PY(0.8), PX(0.8), PY(0.8), { color: L.rgba(C.green, 0.7), lw: 1.5, dash: [4, 6], alpha: ma });
      }

      // ---- 3: 한 건의 보장은 아님 ----
      const a3 = L.ease(L.sub(p3, 0.4, 0.7));
      if (a3 > 0) {
        const r = Math.floor(PICK / N), c = PICK % N;
        const x = GX + c * GS + GS / 2, y = GY + r * GS + GS / 2;
        const tx = GX + N * GS + 40;
        L.line(x + 24, y, tx - 10, y, { color: C.red, lw: 2, alpha: a3 });
        L.text('이 한 건은 틀렸어요', tx, y, { size: 26, weight: 700, color: C.red, alpha: a3 });
      }

      L.caption('“0.8”이라고 하면 {y|실제로 80%} 맞아야 해요', J.cap(S, 1, 2));
      L.caption('잘 보정된 모델은 {y|대각선 위에}, 과신하는 모델은 {r|아래로} 처져요', J.cap(S, 2, 3));
      L.caption('여러 건을 {y|묶어서} 본 비율이지, 한 건이 맞는다는 {r|보장은 아니에요}', J.cap(S, 3));
    },
  });
})();
