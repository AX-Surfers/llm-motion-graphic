/* 5. 신뢰도 — 확률이 한 곳에 몰리면 높고, 고르게 퍼지면 낮다 */
(() => {
  const L = MG.lib, C = L.C, J = window.JV;
  const PW = 780, PXS = [120, 1020];
  const LAB = ['결제', '배송', '반품'];
  const CASES = [
    { msg: '“두 번 결제됐어요! 환불해 주세요”', v: [0.91, 0.06, 0.03], conf: 0.88, col: C.green, word: '높음', win: 0 },
    { msg: '“음… 주문한 거 좀 봐 주실래요?”', v: [0.35, 0.36, 0.29], conf: 0.12, col: C.red, word: '낮음', win: -1 },
  ];

  MG.scene({
    id: 'confidence', title: ['8', '신뢰도 = 얼마나 확신하나'], titleBasic: ['6', '신뢰도 = 얼마나 확신하나'],
    steps: [
      { d: 4.2, n: '확률이 한 곳에 몰림 → 신뢰도 높음' },
      { d: 4.2, n: '고르게 퍼짐 → 신뢰도 낮음' },
    ],
    draw(S, T) {
      CASES.forEach((K, k) => {
        const p = L.st(S, k + 1);
        const a = L.ease(L.sub(p, 0, 0.2));
        if (a <= 0.003) return;
        const x0 = PXS[k], cx = x0 + PW / 2;
        // 메시지
        L.rect(x0, 170, PW, 100, { fill: 'rgba(255,255,255,0.035)', stroke: C.grey, lw: 2, r: 16, alpha: a });
        L.person(x0 + 48, 222, 30, { color: C.blue, alpha: a });
        L.writeText(K.msg, x0 + 84, 220, L.sub(p, 0.05, 0.35), { size: 30 });
        L.fadeText('어느 팀?', cx, 330, L.sub(p, 0.2, 0.35), { size: 28, weight: 700, color: C.yellow, align: 'center' });
        // 세로 막대
        const base = 690, maxH = 300;
        L.line(cx - 300, base, cx + 300, base, { color: C.grey2, lw: 2, alpha: a * L.ease(L.sub(p, 0.2, 0.35)) });
        K.v.forEach((v, i) => {
          const bx = cx + (i - 1) * 190;
          const g = L.ease(L.sub(p, 0.3 + i * 0.06, 0.6 + i * 0.06));
          const h = v * maxH * g;
          const win = i === K.win;
          const col = K.win < 0 ? C.grey : win ? C.yellow : C.grey2;
          L.rect(bx - 55, base - h, 110, h, { fill: L.rgba(col, win ? 0.9 : 0.75), r: 4, alpha: a, glow: win && g > 0.9 ? L.rgba(col, 0.5) : null });
          L.text(Math.round(v * 100 * g) + '%', bx, base - h - 26, { size: 28, font: 'serif', color: win ? C.white : C.dim, align: 'center', alpha: a * Math.min(1, g * 2) });
          L.text(LAB[i], bx, base + 36, { size: 28, color: C.dim, align: 'center', alpha: a * L.ease(L.sub(p, 0.25, 0.4)) });
        });
        // 신뢰도 미터
        const ma = a * L.ease(L.sub(p, 0.65, 0.8));
        const mx0 = x0 + 200, mw = 420, my = 820;
        const cv = K.conf * L.ease(L.sub(p, 0.7, 0.95));
        L.text('신뢰도', x0 + 60, my, { size: 30, weight: 700, color: C.white, alpha: ma });
        L.rect(mx0, my - 16, mw, 32, { fill: C.grey4, stroke: C.grey2, lw: 2, r: 16, alpha: ma });
        if (cv > 0.01) L.rect(mx0, my - 16, mw * cv, 32, { fill: K.col, r: 16, alpha: ma, glow: L.rgba(K.col, 0.5) });
        L.text(cv.toFixed(2), mx0 + mw + 24, my + 2, { size: 36, font: 'serif', color: K.col, alpha: ma });
        L.text(K.word, mx0 + mw + 110, my, { size: 30, weight: 700, color: K.col, alpha: ma * L.ease(L.sub(p, 0.85, 1)) });
      });

      L.caption('확률이 {y|한 곳에 몰리면} → 확신이 커요 ({g|신뢰도 높음})', J.cap(S, 1, 2));
      L.caption('{d|고르게 퍼지면} → 잘 모른다는 뜻이에요 ({r|신뢰도 낮음})', J.cap(S, 2));
    },
  });
})();
