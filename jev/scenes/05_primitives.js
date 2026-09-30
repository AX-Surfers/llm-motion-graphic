/* 4. 질문 도구 3가지 — Choice / Score / Noul */
(() => {
  const L = MG.lib, C = L.C, J = window.JV;
  const PW = 540, PX = [70, 690, 1310], PY0 = 165, PH = 720;
  const QC = J.Q[0], QS = J.Q[2], QN = J.Q[1];
  const PANELS = [
    { q: QC, ko: '여러 개 중 하나 고르기', ask: '“어느 팀이 맡을까?”' },
    { q: QS, ko: '몇 단계쯤인지 매기기', ask: '“얼마나 화났나?”' },
    { q: QN, ko: '맞는지 아닌지 0~1로', ask: '“환불을 원하나?”' },
  ];
  const CH = [{ w: '결제', v: 0.91 }, { w: '배송', v: 0.06 }, { w: '반품', v: 0.03 }];
  const SC = [{ w: '차분', v: 0.10 }, { w: '짜증', v: 0.52 }, { w: '매우 화남', v: 0.38 }];
  const SCORE = SC.reduce((s, it, k) => s + k * it.v, 0); // 1.28
  const NOUL = 0.97;

  MG.scene({
    id: 'primitives', title: ['7', '질문 도구 3가지'], titleBasic: ['5', '질문 도구 3가지'],
    steps: [
      { d: 4.2, n: 'Choice: 하나 고르기' },
      { d: 4.4, n: 'Score: 단계 매기기 (사이 값 가능)' },
      { d: 4.0, n: 'Noul: 0~1 (0.5 = 잘 모름)' },
      { d: 5.6, n: 'Score 계산식: 단계 × 확률의 합', skipBasic: true },
      { d: 4.6, n: 'Noul에는 신뢰도가 따로 없다', skipBasic: true },
    ],
    draw(S, T) {
      const ps = [L.st(S, 1), L.st(S, 2), L.st(S, 3)];

      PANELS.forEach((P, k) => {
        const p = ps[k];
        const dim = k < 2 ? L.lerp(1, 0.5, L.ease(L.sub(ps[k + 1], 0, 0.25))) : 1;
        const a = L.ease(L.sub(p, 0, 0.25)) * dim;
        if (a <= 0.003) return;
        const x0 = PX[k], cx = x0 + PW / 2, c = P.q.c;
        const active = k === 2 ? 1 : 1 - L.ease(L.sub(ps[k + 1], 0, 0.25));
        L.rect(x0, PY0, PW, PH, { fill: 'rgba(255,255,255,0.025)', stroke: L.mix(C.grey2, c, active * 0.8), lw: 2, r: 18, alpha: a, draw: L.ease(L.sub(p, 0, 0.3)) });
        L.text(P.q.name, cx, 235, { size: 50, font: 'serifI', color: c, align: 'center', alpha: a });
        L.text(P.ko, cx, 295, { size: 26, color: C.dim, align: 'center', alpha: a });
        L.text(P.ask, cx, 365, { size: 32, weight: 600, color: C.white, align: 'center', alpha: a * L.ease(L.sub(p, 0.1, 0.3)) });
        L.line(x0 + 40, 410, x0 + PW - 40, 410, { color: C.grey3, lw: 1.5, alpha: a });

        if (k === 0) {
          // 확률 막대 → 제일 높은 것을 고른다
          const hl = L.ease(L.sub(p, 0.7, 0.85));
          L.bars(x0 + 170, 500, CH.map((it, i) => ({ ...it, c: i === 0 ? c : C.grey2, hl: i === 0 && hl > 0.5 })), L.sub(p, 0.2, 0.7), { gap: 95, size: 34, maxW: 240, vmax: 1, alpha: a });
          L.rect(x0 + 40, 500 - 38, PW - 80, 76, { stroke: c, lw: 3, r: 12, alpha: a * hl, glow: L.rgba(c, 0.6) });
          L.tile('결제팀', cx, 820, { size: 36, color: c, stroke: c, fill: 'rgba(40,34,8,0.92)', glow: L.rgba(c, 0.4), alpha: a * L.ease(L.sub(p, 0.8, 1)), scale: 0.8 + 0.2 * L.back(L.sub(p, 0.8, 1)) });
        }
        if (k === 1) {
          // 단계마다 확률 → 바늘이 단계 '사이'에 선다
          const rx0 = x0 + 80, step = 190, ry = 670;
          const la = a * L.ease(L.sub(p, 0.1, 0.3));
          L.line(rx0 - 20, ry, rx0 + 2 * step + 20, ry, { color: C.grey, lw: 3, alpha: la });
          SC.forEach((it, i) => {
            const tx = rx0 + i * step;
            L.line(tx, ry - 10, tx, ry + 10, { color: C.grey, lw: 3, alpha: la });
            L.text(it.w, tx, ry + 42, { size: 26, color: C.dim, align: 'center', alpha: la });
            const g = L.ease(L.sub(p, 0.2 + i * 0.08, 0.5 + i * 0.08));
            const bh = it.v * 360 * g;
            L.rect(tx - 34, ry - 14 - bh, 68, bh, { fill: L.rgba(c, 0.75), r: 4, alpha: a });
            L.text(Math.round(it.v * 100 * g) + '%', tx, ry - 34 - bh, { size: 26, font: 'serif', color: C.dim, align: 'center', alpha: a * Math.min(1, g * 2) });
          });
          const mv = L.ease(L.sub(p, 0.55, 0.85));
          const mx = rx0 + SCORE * step * mv;
          const ma = a * L.ease(L.sub(p, 0.5, 0.6));
          L.line(mx, ry - 26, mx, ry + 8, { color: C.white, lw: 3, alpha: ma });
          L.circle(mx, ry, 10, { fill: C.white, alpha: ma, glow: L.rgba(C.white, 0.8) });
          L.text((SCORE * mv).toFixed(1), mx, ry + 44, { size: 30, font: 'serif', color: C.white, align: 'center', alpha: ma * L.ease(L.sub(p, 0.6, 0.7)) });
          L.rich('점수 {t|1.3} · 짜증과 매우 화남 {t|사이}', cx, 820, { size: 28, align: 'center', alpha: a * L.ease(L.sub(p, 0.85, 1)) });
        }
        if (k === 2) {
          // 0~1 게이지
          const gx0 = x0 + 70, gw = 400, gy = 610, gh = 46;
          const la = a * L.ease(L.sub(p, 0.1, 0.3));
          const v = NOUL * L.ease(L.sub(p, 0.3, 0.8));
          L.rect(gx0, gy - gh / 2, gw, gh, { fill: C.grey4, stroke: C.grey2, lw: 2, r: gh / 2, alpha: la });
          if (v > 0.01) L.rect(gx0, gy - gh / 2, gw * v, gh, { fill: L.rgba(c, 0.85), r: gh / 2, alpha: a, glow: L.rgba(c, 0.5) });
          L.line(gx0 + gw / 2, gy - 40, gx0 + gw / 2, gy + 40, { color: C.white, lw: 2, dash: [6, 6], alpha: la * 0.7 });
          L.text('0', gx0, gy - 56, { size: 30, font: 'serif', color: C.dim, align: 'center', alpha: la });
          L.text('1', gx0 + gw, gy - 56, { size: 30, font: 'serif', color: C.dim, align: 'center', alpha: la });
          L.text('아니다', gx0, gy + 64, { size: 24, color: C.grey, align: 'center', alpha: la });
          L.text('0.5 = 잘 모름', gx0 + gw / 2, gy + 64, { size: 24, color: C.grey, align: 'center', alpha: la });
          L.text('맞다', gx0 + gw, gy + 64, { size: 24, color: C.grey, align: 'center', alpha: la });
          L.text(v.toFixed(2), cx, 500, { size: 72, font: 'serif', color: c, align: 'center', alpha: a * L.ease(L.sub(p, 0.25, 0.4)), glow: L.rgba(c, 0.5) });
          L.text('거의 확실히 환불 요청', cx, 820, { size: 30, weight: 700, color: c, align: 'center', alpha: a * L.ease(L.sub(p, 0.82, 1)) });
        }
      });

      // ---- (공학) ④ Score 계산식, ⑤ Noul은 숫자 하나 ----
      const p4 = MG.variant === 'basic' ? 0 : L.st(S, 4), p5 = MG.variant === 'basic' ? 0 : L.st(S, 5);
      const oa = L.ease(L.sub(p4, 0, 0.2));
      if (oa > 0.003) {
        L.rect(0, 130, 1920, 800, { fill: 'rgba(0,0,0,0.82)', r: 0, alpha: oa });
        L.rect(230, 200, 1460, 660, { fill: 'rgba(14,14,14,0.97)', stroke: C.grey2, lw: 2, r: 20, alpha: oa });
        const o4 = oa * (1 - L.ease(L.sub(p5, 0, 0.2)));
        if (o4 > 0.003) {
          L.text('Score', 960, 270, { size: 46, font: 'serifI', color: QS.c, align: 'center', alpha: o4 });
          const segs = [
            { t: 'score', o: { font: 'math', color: C.white } }, { t: ' = ', o: { font: 'serif', color: C.white } },
            { t: '0', o: { font: 'serif', color: C.dim } }, { t: '×', o: { font: 'serif', color: C.grey } }, { t: '0.10', o: { font: 'serif', color: QS.c } }, { t: ' + ', o: { font: 'serif', color: C.white } },
            { t: '1', o: { font: 'serif', color: C.dim } }, { t: '×', o: { font: 'serif', color: C.grey } }, { t: '0.52', o: { font: 'serif', color: QS.c } }, { t: ' + ', o: { font: 'serif', color: C.white } },
            { t: '2', o: { font: 'serif', color: C.dim } }, { t: '×', o: { font: 'serif', color: C.grey } }, { t: '0.38', o: { font: 'serif', color: QS.c } },
            { t: ' = 1.28', o: { font: 'serif', color: C.yellow } },
          ];
          const ws = segs.map((g) => L.tw(g.t, Object.assign({ size: 56 }, g.o)));
          let x = 960 - ws.reduce((a, b) => a + b, 0) / 2;
          segs.forEach((g, i) => { L.writeText(g.t, x, 380, L.sub(p4, 0.1 + i * 0.025, 0.35 + i * 0.025), Object.assign({ size: 56, alpha: o4 }, g.o)); x += ws[i]; });
          L.fadeText('단계 번호 × 그 단계의 확률을 모두 더한 값', 960, 450, L.sub(p4, 0.45, 0.6), { size: 28, color: C.dim, align: 'center', alpha: o4 });
          // 같은 점수, 다른 분포
          const da = o4 * L.ease(L.sub(p4, 0.6, 0.8));
          const dist = [{ v: [0, 1, 0], l: '확신: 전부 “짜증”', c: C.green }, { v: [0.5, 0, 0.5], l: '반반: 차분 아니면 매우 화남', c: C.red }];
          dist.forEach((D, j) => {
            const cx = 700 + j * 520;
            D.v.forEach((v, k) => {
              const bx = cx + (k - 1) * 90, h = v * 150;
              L.rect(bx - 30, 720 - h, 60, Math.max(2, h), { fill: L.rgba(D.c, 0.8), r: 4, alpha: da });
              L.text(String(k), bx, 745, { size: 22, font: 'serif', color: C.grey, align: 'center', alpha: da });
            });
            L.text('score = 1.0', cx, 540, { size: 30, font: 'serif', color: C.white, align: 'center', alpha: da });
            L.text(D.l, cx, 790, { size: 24, color: D.c, align: 'center', alpha: da });
          });
          L.text('점수가 같아도 분포는 다를 수 있어요 → 그래서 확률도 함께 줘요', 960, 830, { size: 24, color: C.grey, align: 'center', alpha: da });
        }
        const o5 = oa * L.ease(L.sub(p5, 0.1, 0.3));
        if (o5 > 0.003) {
          L.text('Noul', 960, 270, { size: 46, font: 'serifI', color: QN.c, align: 'center', alpha: o5 });
          const g = L.ease(L.sub(p5, 0.25, 0.55));
          [{ w: '예 (yes)', v: 0.97, c: QN.c }, { w: '아니요 (no)', v: 0.03, c: C.grey }].forEach((B, j) => {
            const y = 400 + j * 100;
            L.text(B.w, 700, y, { size: 32, color: C.text, align: 'right', alpha: o5 });
            L.rect(730, y - 26, 600 * B.v * g + 2, 52, { fill: L.rgba(B.c, 0.85), r: 6, alpha: o5 });
            L.text((B.v * g).toFixed(2), 745 + 600 * B.v * g + 10, y, { size: 32, font: 'serif', color: C.white, alpha: o5 });
          });
          L.fadeText('칸이 두 개뿐 → 하나가 0.97이면 나머지는 저절로 0.03', 960, 640, L.sub(p5, 0.55, 0.7), { size: 30, color: C.dim, align: 'center', alpha: o5 });
          L.rich('숫자 하나가 {p|답이자 확신} — 그래서 신뢰도 값이 따로 없어요', 960, 740, { size: 32, align: 'center', alpha: o5 * L.ease(L.sub(p5, 0.7, 0.9)) });
        }
      }

      L.caption('{y|Choice} — 여러 개 중 {y|하나}를 골라요', J.cap(S, 1, 2));
      L.caption('{t|Score} — 몇 단계인지 매겨요 (칸 {t|사이} 값도 돼요)', J.cap(S, 2, 3));
      L.caption('{p|Noul} — 맞는지를 0~1로 (0.5 = 잘 모름)', J.cap(S, 3, 4));
      if (MG.variant !== 'basic') {
        L.caption('Score = {t|단계 × 확률}의 합', J.cap(S, 4, 5));
        L.caption('Noul은 숫자 하나가 {p|답이자 확신}', J.cap(S, 5));
      }
    },
  });
})();
