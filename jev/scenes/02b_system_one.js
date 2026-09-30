/* (공학) 빠른 생각, System One — LLM은 글자를 이어 쓰고, Jev는 주어진 선택지에 확률을 한 번에 매긴다 */
(() => {
  const L = MG.lib, C = L.C, J = window.JV;
  const TOK = ['고객님', '께서는', '결제', '과정에서', '불편을', '겪으신', '것', '같고,', '환불을', '…'];
  const OPTS = [{ w: '결제', v: 0.91 }, { w: '배송', v: 0.06 }, { w: '반품', v: 0.03 }];
  const K = TOK.length;
  const wts = [...Array(K)].map((_, k) => Math.pow(0.84, k));
  const tot = wts.reduce((s, v) => s + v, 0);
  const bnd = [0]; wts.forEach((w) => bnd.push(bnd[bnd.length - 1] + w / tot));

  MG.scene({
    id: 'system-one', only: 'full', title: ['3', '빠른 생각, System One'],
    steps: [
      { d: 4.2, n: '빠른 생각 / 느린 생각 (카너먼)' },
      { d: 6.0, n: 'LLM은 단어를 이어 쓰고, Jev는 선택지에 확률을 한 번에' },
      { d: 4.4, n: '약 100ms · 입력에만 요금' },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = L.st(S, 3);
      const o1 = 1 - L.ease(L.sub(p2, 0, 0.18));

      // ---- 1: System 1 / System 2 ----
      if (o1 > 0.003) {
        const cards = [
          { x: 230, h: 'System 1', k: '빠른 생각', ex: ['“2 + 2 = ?”', '화난 얼굴 알아보기'], c: C.yellow, t: '직관적 · 즉각적' },
          { x: 1010, h: 'System 2', k: '느린 생각', ex: ['“17 × 24 = ?”', '복잡한 계획 세우기'], c: C.grey, t: '신중함 · 오래 걸림' },
        ];
        cards.forEach((cd, i) => {
          const a = o1 * L.ease(L.sub(p1, 0.05 + i * 0.2, 0.35 + i * 0.2));
          if (a <= 0.003) return;
          L.rect(cd.x, 250, 680, 460, { fill: L.rgba(cd.c, i === 0 ? 0.06 : 0.02), stroke: cd.c, lw: i === 0 ? 3 : 2, r: 20, alpha: a, glow: i === 0 ? L.rgba(cd.c, 0.3) : null });
          L.text(cd.h, cd.x + 340, 330, { size: 52, font: 'serifI', color: cd.c, align: 'center', alpha: a });
          L.text(cd.k, cd.x + 340, 400, { size: 36, weight: 700, color: C.white, align: 'center', alpha: a });
          cd.ex.forEach((e, j) => L.text(e, cd.x + 340, 490 + j * 56, { size: 30, color: C.dim, align: 'center', alpha: a }));
          L.text(cd.t, cd.x + 340, 650, { size: 28, color: cd.c, align: 'center', alpha: a });
        });
        const ja = o1 * L.ease(L.sub(p1, 0.6, 0.85));
        L.tile('Jev는 여기', 570, 790, { size: 34, weight: 700, color: C.yellow, stroke: C.yellow, fill: 'rgba(40,34,8,0.95)', glow: L.rgba(C.yellow, 0.4), alpha: ja });
        L.arrow(570, 760, 570, 725, ja, { color: C.yellow, lw: 3 });
        L.text('— 대니얼 카너먼, 『생각에 관한 생각』', 1350, 800, { size: 24, color: C.grey, align: 'center', alpha: ja });
      }

      // ---- 2: 두 방식 비교 ----
      const a2 = L.ease(L.sub(p2, 0.12, 0.3)) * (1 - L.ease(L.sub(p3, 0, 0.15)) * 0.35);
      if (a2 > 0.003) {
        // LLM 줄
        const Y1 = 330;
        L.text('LLM', 110, Y1, { size: 40, font: 'serif', color: C.purple, alpha: a2 });
        L.text('다음 단어를 하나씩 → 반복', 110, Y1 + 50, { size: 24, color: C.grey, alpha: a2 });
        let x = 470;
        const tp = L.sub(p2, 0.2, 0.95);
        TOK.forEach((w, i) => {
          const q = L.sub(tp, bnd[i], bnd[i + 1]);
          if (q <= 0) return;
          const tw = L.tileW(w, { size: 28 });
          if (x + tw > 1830) return;
          L.tile(w, x + tw / 2, Y1, { size: 28, color: C.text, stroke: L.rgba(C.purple, 0.6), alpha: L.ease(q), scale: 0.8 + 0.2 * L.back(q) });
          x += tw + 10;
        });
        const lp = L.ease(L.sub(p2, 0.2, 0.3));
        if (lp > 0) {
          const f = L.cbez(1780, Y1 + 40, 1800, Y1 + 120, 520, Y1 + 120, 490, Y1 + 40);
          L.pathLine(f, 0, lp, { color: L.rgba(C.purple, 0.6), lw: 2.5, dash: [8, 8], head: 14, alpha: a2 });
        }
        L.line(110, 530, 1810, 530, { color: C.grey3, lw: 1.5, alpha: a2 });
        // Jev 줄
        const Y2 = 700;
        L.text('Jev', 110, Y2 - 60, { size: 40, font: 'serif', color: C.yellow, alpha: a2 });
        L.text('선택지 전체에 확률을 한 번에', 110, Y2 - 10, { size: 24, color: C.grey, alpha: a2 });
        const bp = L.sub(p2, 0.55, 0.8);
        L.bars(640, Y2 - 80, OPTS.map((o, i) => ({ ...o, c: i === 0 ? C.yellow : C.grey2, hl: i === 0 && bp >= 1 })), bp, { gap: 72, size: 32, maxW: 520, vmax: 1, stag: 0, alpha: a2 });
        L.fadeText('선택지 밖의 답은 나올 수 없어요', 1500, Y2, L.sub(p2, 0.8, 1), { size: 26, color: C.dim, align: 'center', alpha: a2 });
      }

      // ---- 3: 속도와 비용 ----
      if (p3 > 0) {
        const a = L.ease(L.sub(p3, 0.1, 0.35));
        L.rect(300, 820, 1320, 110, { fill: 'rgba(10,10,10,0.95)', stroke: C.yellow, lw: 2, r: 16, alpha: a });
        const ms = Math.round(100 * L.ease(L.sub(p3, 0.15, 0.6)));
        L.text(ms + 'ms', 470, 876, { size: 56, font: 'serif', color: C.yellow, align: 'center', alpha: a });
        L.text('대부분 이 안에 끝나요', 470, 915, { size: 20, color: C.grey, align: 'center', alpha: a });
        L.rich('요금은 {y|입력}에만 · 출력은 {g|무료}', 960, 876, { size: 30, align: 'center', alpha: a * L.ease(L.sub(p3, 0.4, 0.6)) });
        L.rich('한 번에 {y|64k} 토큰까지', 1440, 876, { size: 30, align: 'center', alpha: a * L.ease(L.sub(p3, 0.55, 0.75)) });
      }

      L.caption('이름은 {y|빠르고 직관적인 판단}(System 1)에서 왔어요', J.cap(S, 1, 2));
      L.caption('글을 쓰지 않고 {y|선택지 위의 확률 분포}를 돌려줘요', J.cap(S, 2, 3));
      L.caption('대부분 약 {y|100ms} — 실시간으로 쓸 수 있어요', J.cap(S, 3));
    },
  });
})();
