/* 2. 코드와 LLM 사이의 빈칸 — 코드는 빠르지만 말뜻을 모르고, LLM은 말뜻을 알지만 느리고 비싸다 */
(() => {
  const L = MG.lib, C = L.C, J = window.JV;
  const AX0 = 300, AX1 = 1620, AY = 215;
  const PN = [{ x: 90, w: 780 }, { x: 1050, w: 780 }];
  const MSGS = ['“중복 결제된 건 환불해 주세요”', '“환불은 됐고, 배송만 빨리요”', '“돈 돌려받을 수 있을까요?”'];
  const CODE_R = [{ ok: true, t: '맞음' }, { ok: false, t: '틀림' }, { ok: false, t: '놓침' }];
  const COLS = ['코드', 'Jev', 'LLM'];
  const ROWS = [
    { k: '말뜻 이해', v: [['모름', 0], ['이해함', 1], ['이해함', 1]] },
    { k: '속도', v: [['아주 빠름', 1], ['약 0.1초', 1], ['느림', 0]] },
    { k: '비용', v: [['거의 0', 1], ['약 100배 저렴', 1], ['비쌈', 0]] },
    { k: '답의 모양', v: [['정해진 값', 1], ['정해진 칸', 1], ['긴 글', 0]] },
  ];

  function panel(k, p, a, o) {
    const P = PN[k];
    if (a <= 0.003) return;
    L.rect(P.x, 290, P.w, 590, { fill: 'rgba(255,255,255,0.03)', stroke: o.col, lw: 2, r: 18, alpha: a, draw: L.ease(L.sub(p, 0, 0.3)) });
    L.text(o.name, P.x + 36, 345, { size: 38, weight: 700, color: o.col, alpha: a });
    L.text(o.sub, P.x + 36 + L.tw(o.name, { size: 38, weight: 700 }) + 18, 347, { size: 26, color: C.grey, alpha: a });
    if (o.rule) {
      const ra = a * L.ease(L.sub(p, 0.12, 0.3));
      L.rect(P.x + 30, 385, P.w - 60, 64, { fill: 'rgba(88,196,221,0.08)', stroke: L.rgba(C.blue, 0.5), lw: 1.5, r: 10, alpha: ra });
      L.rich(o.rule, P.x + 52, 418, { size: 28, alpha: ra });
    }
    MSGS.forEach((m, i) => {
      const y = 510 + i * 82, q = L.sub(p, 0.25 + i * 0.13, 0.45 + i * 0.13);
      L.text(m, P.x + 40, y, { size: 29, color: C.text, alpha: a * L.ease(q) });
      const r = o.res[i], rc = r.ok ? C.green : C.red, ix = P.x + P.w - 150;
      if (r.ok) J.check(ix, y, 34, L.sub(q, 0.4, 1), rc, a); else J.cross(ix, y, 34, L.sub(q, 0.4, 1), rc, a);
      L.text(r.t, ix + 30, y + 1, { size: 28, weight: 700, color: rc, alpha: a * L.ease(L.sub(q, 0.6, 1)) });
    });
    L.rich(o.sum, P.x + P.w / 2, 815, { size: 30, align: 'center', alpha: a * L.ease(L.sub(p, 0.8, 1)) });
  }

  MG.scene({
    id: 'gap', title: ['2', '코드와 LLM 사이의 빈칸'], titleBasic: ['2', '코드와 LLM 사이의 빈칸'],
    steps: [
      { d: 5.0, n: '코드: 빠르고 싸지만 말뜻을 모른다' },
      { d: 4.6, n: 'LLM: 말뜻은 알지만 느리고 비싸다' },
      { d: 5.0, n: 'Jev가 그 사이를 채운다' },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = L.st(S, 3);
      const out = 1 - L.ease(L.sub(p3, 0, 0.2));

      // ---- 위쪽 축: 코드 ─── ? ─── LLM ----
      const aa = L.ease(L.sub(p1, 0, 0.2));
      L.line(AX0, AY, AX1, AY, { color: C.grey2, lw: 3, alpha: aa });
      L.circle(AX0, AY, 12, { fill: C.blue, alpha: aa });
      L.text('코드', AX0, AY - 44, { size: 32, weight: 700, color: C.blue, align: 'center', alpha: aa });
      const la = L.ease(L.sub(p2, 0, 0.2));
      L.circle(AX1, AY, 12, { fill: C.purple, alpha: la });
      L.text('LLM', AX1, AY - 44, { size: 32, weight: 700, font: 'serif', color: C.purple, align: 'center', alpha: la });
      const land = L.ease(L.sub(p3, 0.1, 0.4));
      const qa = la * (1 - land);
      L.rect(860, AY - 30, 200, 60, { stroke: C.grey, lw: 2, dash: [8, 8], r: 12, alpha: qa });
      L.text('?', 960, AY + 2, { size: 44, weight: 800, color: C.grey, align: 'center', alpha: qa });
      if (land > 0) {
        L.tile('Jev', 960, L.lerp(AY - 120, AY, L.easeOut(land)), { size: 38, weight: 700, color: C.yellow, stroke: C.yellow, fill: 'rgba(40,34,8,0.95)', glow: L.rgba(C.yellow, 0.5 * land), alpha: land });
      }

      // ---- 1·2: 두 패널 ----
      panel(0, p1, out * L.ease(L.sub(p1, 0, 0.2)), {
        name: '코드', sub: '정해진 규칙대로', col: C.blue,
        rule: '만약 {y|‘환불’}이라는 단어가 있으면  →  환불 처리', res: CODE_R,
        sum: '{g|빠르고 싸지만} 말뜻은 {r|몰라요}',
      });
      panel(1, p2, out * L.ease(L.sub(p2, 0, 0.2)), {
        name: 'LLM', sub: '글을 쓰는 AI', col: C.purple,
        res: [{ ok: true, t: '맞음' }, { ok: true, t: '맞음' }, { ok: true, t: '맞음' }],
        sum: '말뜻은 {g|알지만} {r|느리고 비싸고 긴 글}로 답해요',
      });

      // ---- 3: 비교표 ----
      if (p3 > 0.15) {
        const tx0 = 480, cw = 380, kx = 250, ty = 330, rh = 104;
        const ta = L.ease(L.sub(p3, 0.2, 0.45));
        const ja = L.ease(L.sub(p3, 0.5, 0.7));
        L.rect(tx0 + cw + 10, ty - 30, cw - 20, 60 + rh * ROWS.length + 30, { fill: L.rgba(C.yellow, 0.07), stroke: C.yellow, lw: 2.5, r: 16, alpha: ja, glow: L.rgba(C.yellow, 0.35) });
        COLS.forEach((c, j) => {
          const col = [C.blue, C.yellow, C.purple][j];
          L.text(c, tx0 + cw * j + cw / 2, ty, { size: 34, weight: 700, font: j === 2 || j === 1 ? 'serif' : undefined, color: col, align: 'center', alpha: ta });
        });
        ROWS.forEach((r, i) => {
          const y = ty + 80 + rh * i;
          const ra = L.ease(L.sub(p3, 0.25 + i * 0.07, 0.45 + i * 0.07));
          L.line(kx, y - rh / 2 + 6, tx0 + cw * 3, y - rh / 2 + 6, { color: C.grey3, lw: 1.5, alpha: ra });
          L.text(r.k, kx, y, { size: 30, color: C.dim, alpha: ra });
          r.v.forEach(([t, good], j) => {
            L.text(t, tx0 + cw * j + cw / 2, y, { size: 32, weight: j === 1 ? 700 : 500, color: good ? (j === 1 ? C.yellow : C.green) : C.red, align: 'center', alpha: ra });
          });
        });
      }

      L.caption('코드는 {g|빠르고 싸지만} 말뜻을 {r|몰라요}', J.cap(S, 1, 2));
      L.caption('LLM은 말뜻을 {g|알지만} {r|느리고 비싸요}', J.cap(S, 2, 3));
      L.caption('Jev는 그 {y|사이 빈칸}을 채워요 — 말뜻은 알고, 코드처럼 빠르게', J.cap(S, 3));
    },
  });
})();
