/* 6. 신뢰도로 행동 정하기 — 높음 자동 / 중간 확인 / 낮음 사람에게, 위험할수록 기준을 높게 */
(() => {
  const L = MG.lib, C = L.C, J = window.JV;
  const MX0 = 360, MW = 1200, MY = 470, MH = 44;
  const BANDS = [
    { a: 0, b: 0.5, c: C.red, lab: '낮음', act: '사람에게 넘김', icon: 'person' },
    { a: 0.5, b: 0.8, c: C.yellow, lab: '중간', act: '확인받고 진행', icon: 'ask' },
    { a: 0.8, b: 1, c: C.green, lab: '높음', act: '자동 실행', icon: 'play' },
  ];
  const X = (v) => MX0 + MW * v;
  const RX0 = 470, RW = 900;
  const RX = (v) => RX0 + RW * v;
  const ROWS = [
    { y: 440, name: '잔액 조회', risk: '위험 낮음', rc: C.green, th: null, res: '바로 실행', col: C.green },
    { y: 690, name: '송금', risk: '위험 높음', rc: C.red, th: 0.9, res: '확인 요청', col: C.yellow },
  ];
  const CONF = 0.85;

  MG.scene({
    id: 'gating', title: ['11', '신뢰도로 행동 정하기'], titleBasic: ['7', '신뢰도로 행동 정하기'],
    steps: [
      { d: 4.4, n: '신뢰도 구간별로 다르게 행동' },
      { d: 5.2, n: '위험한 일(송금)은 0.9 이상만 바로' },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2);
      const out = 1 - L.ease(L.sub(p2, 0, 0.2));

      // ---- 1: 구간 ----
      if (out > 0.003) {
        const a = out;
        L.text('신뢰도', MX0 - 40, MY, { size: 32, weight: 700, color: C.white, align: 'right', alpha: a * L.ease(L.sub(p1, 0, 0.2)) });
        BANDS.forEach((B, i) => {
          const g = L.ease(L.sub(p1, 0.1 + i * 0.2, 0.35 + i * 0.2));
          if (g <= 0) return;
          const x = X(B.a), w = (X(B.b) - x) * g;
          L.rect(x + 3, MY - MH / 2, Math.max(0, w - 6), MH, { fill: L.rgba(B.c, 0.8), r: 8, alpha: a });
          const mx = (X(B.a) + X(B.b)) / 2;
          L.text(B.lab, mx, MY - 62, { size: 32, weight: 700, color: B.c, align: 'center', alpha: a * g });
          // 행동
          const ga = a * L.ease(L.sub(p1, 0.25 + i * 0.2, 0.45 + i * 0.2));
          L.arrow(mx, MY + 36, mx, MY + 110, ga > 0 ? 1 : 0, { color: L.rgba(B.c, 0.8), lw: 3, alpha: ga });
          const iy = MY + 175;
          if (B.icon === 'person') L.person(mx, iy, 54, { color: B.c, alpha: ga });
          if (B.icon === 'ask') L.text('?', mx, iy, { size: 76, weight: 800, color: B.c, align: 'center', alpha: ga });
          if (B.icon === 'play') { const ctx = L.ctx; ctx.save(); ctx.globalAlpha *= ga; ctx.fillStyle = B.c; ctx.beginPath(); ctx.moveTo(mx - 22, iy - 30); ctx.lineTo(mx + 32, iy); ctx.lineTo(mx - 22, iy + 30); ctx.closePath(); ctx.fill(); ctx.restore(); }
          L.text(B.act, mx, iy + 80, { size: 32, weight: 700, color: B.c, align: 'center', alpha: ga });
        });
        const ta = a * L.ease(L.sub(p1, 0.1, 0.3));
        L.text('0', X(0), MY + 48, { size: 28, font: 'serif', color: C.grey, align: 'center', alpha: ta });
        L.text('0.5', X(0.5), MY + 48, { size: 28, font: 'serif', color: C.grey, align: 'center', alpha: ta * 0 });
        L.text('1', X(1), MY + 48, { size: 28, font: 'serif', color: C.grey, align: 'center', alpha: ta });
      }

      // ---- 2: 같은 신뢰도라도 위험도에 따라 다르게 ----
      if (p2 > 0.15) {
        const mv = L.ease(L.sub(p2, 0.35, 0.6));
        ROWS.forEach((R, i) => {
          const a = L.ease(L.sub(p2, 0.15 + i * 0.08, 0.35 + i * 0.08));
          L.text(R.name, 120, R.y - 16, { size: 38, weight: 700, color: C.white, alpha: a });
          L.text(R.risk, 120, R.y + 30, { size: 26, color: R.rc, alpha: a });
          L.rect(RX0, R.y - 20, RW, 40, { fill: C.grey4, stroke: C.grey2, lw: 2, r: 20, alpha: a });
          L.text('0', RX0, R.y + 50, { size: 26, font: 'serif', color: C.grey, align: 'center', alpha: a });
          L.text('1', RX0 + RW, R.y + 50, { size: 26, font: 'serif', color: C.grey, align: 'center', alpha: a });
          if (R.th !== null) {
            const tx = RX(R.th);
            L.rect(tx, R.y - 20, RX0 + RW - tx, 40, { fill: L.rgba(C.green, 0.3), r: 0, alpha: a });
            L.line(tx, R.y - 44, tx, R.y + 44, { color: C.white, lw: 3, alpha: a });
            L.text('기준 0.9', tx, R.y - 66, { size: 28, weight: 700, color: C.white, align: 'center', alpha: a });
          } else {
            L.text('기준 없음', RX0 + 20, R.y - 44, { size: 24, color: C.grey, alpha: a });
          }
          // 신뢰도 표시
          if (mv > 0) {
            const x = RX(CONF * mv);
            L.rect(RX0, R.y - 20, x - RX0, 40, { fill: L.rgba(C.blue, 0.55), r: 20, alpha: a });
            L.circle(x, R.y, 14, { fill: C.blue, alpha: a, glow: L.rgba(C.blue, 0.8) });
            L.text((CONF * mv).toFixed(2), x, R.y + 50, { size: 28, font: 'serif', color: C.blue, align: 'center', alpha: a * L.ease(L.sub(p2, 0.4, 0.5)) });
          }
          // 결과
          const ra = L.ease(L.sub(p2, 0.68 + i * 0.12, 0.85 + i * 0.12));
          L.arrow(RX0 + RW + 24, R.y, RX0 + RW + 84, R.y, ra, { color: R.col, lw: 3 });
          L.tile(R.res, 1620, R.y, { size: 34, color: R.col, stroke: R.col, fill: 'rgba(20,20,20,0.95)', glow: L.rgba(R.col, 0.4), alpha: ra, scale: 0.8 + 0.2 * L.back(ra) });
        });
        L.fadeText('둘 다 신뢰도 0.85', 960, 250, L.sub(p2, 0.5, 0.65), { size: 30, color: C.blue, align: 'center' });
      }

      L.caption('확신 정도에 따라 {y|다르게 행동}해요', J.cap(S, 1, 2));
      L.caption('위험한 일일수록 {r|기준을 높게} 잡아요', J.cap(S, 2));
    },
  });
})();
