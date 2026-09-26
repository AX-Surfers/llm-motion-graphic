/* 9. 전체 흐름 → 블랙박스 → 핵심 정리 */
(() => {
  const L = MG.lib, C = L.C;
  const TOK = ['밖에', '눈이', '많이'], TX = 175, TYS = [420, 520, 620];
  const M = { x: 870, y: 520, s: 74, yaw: 0.55, pitch: 0.28, explode: 1, n: 10, spread: 2.4, rows: 3, cols: 3, L: 3.2, h: 2.2, d: 2.2 };
  const ATT = '#2B4953', FFN = '#4E4630';
  const OUTV = 1245;
  const BX = 1545, BY = 430, GAP = 72;
  const ITEMS = [
    { w: '내린다', v: 0.71, c: C.yellow },
    { w: '온다', v: 0.17, c: C.teal },
    { w: '쌓였다', v: 0.08, c: C.blue },
    { w: '기타', v: 0.04, c: C.grey },
  ];
  const SUMMARY = [
    'LLM은 {y|다음 단어 맞히기}를 아주 잘하도록 훈련된 프로그램',
    '방대한 글을 읽으며 {y|수천억 개의 다이얼}을 조금씩 맞춘다',
    '{y|사전 훈련}으로 기본기를, {g|사람 피드백}으로 좋은 비서가 된다',
    '{b|트랜스포머}는 문장 전체를 한 번에, {b|어텐션}은 문맥으로 뜻을 조정',
    '왜 그렇게 답했는지는 만든 사람도 설명하기 어렵다 — {y|블랙박스}',
  ];
  const SUMMARY_BASIC = [...SUMMARY];
  SUMMARY_BASIC[3] = '문장 전체를 한 번에 보고, {b|주변 단어(문맥)}로 뜻을 정한다';
  const bump = (x) => Math.exp(-x * x * 1.1);
  const NL = 90; // 블랙박스 안의 얽힌 연결선

  function stripV(x, y, seed, a, n = 5) {
    for (let k = 0; k < n; k++) {
      const v = (L.rnd(seed * 7 + k * 3.1) - 0.5) * 2;
      L.rect(x - 14, y - (n * 16) / 2 + k * 16, 28, 13, { fill: L.rgba(v >= 0 ? C.blue : C.red, 0.15 + 0.75 * Math.abs(v)), r: 2, alpha: a });
    }
  }

  MG.scene({
    id: 'blackbox', title: ['9', '전체 흐름과 블랙박스'], titleBasic: ['8', '블랙박스와 정리'],
    steps: [
      { d: 5.4, n: '문장 → 벡터 → 레이어 → 확률 → 다음 단어', skipBasic: true },
      { d: 4.2, n: '왜 이 답일까? 블랙박스' },
      { d: 5.0, n: '핵심 정리' },
    ],
    draw(S, T) {
      const ctx = L.ctx;
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = L.st(S, 3);
      const A = 1 - L.ease(L.sub(p3, 0, 0.22));
      const B = MG.variant === 'basic'; // 초보자: 전체 흐름 없이 블록 → 블랙박스
      const MX = B ? 960 : M.x;
      const q2 = B ? L.sub(p2, 0.3, 1) : p2; // 초보자: 블록을 먼저 보여 준 뒤 블랙박스로

      if (A > 0.003) {
        // ---- 입력 토큰 → 벡터 ----
        if (!B) TOK.forEach((w, i) => {
          const a = A * L.ease(L.sub(p1, i * 0.04, 0.12 + i * 0.04));
          L.tile(w, TX, TYS[i], { size: 34, alpha: a });
          L.arrow(TX + 62, TYS[i], TX + 118, TYS[i], L.ease(L.sub(p1, 0.08, 0.16)), { color: C.grey2, lw: 3, head: 11, alpha: A });
          stripV(TX + 150, TYS[i], i + 3, A * L.ease(L.sub(p1, 0.12, 0.2)));
        });
        if (!B) L.text('문장', TX, TYS[0] - 70, { size: 24, color: C.grey, align: 'center', alpha: A * L.sub(p1, 0.05, 0.15) });
        if (!B) L.text('벡터', TX + 150, TYS[0] - 70, { size: 24, color: C.grey, align: 'center', alpha: A * L.sub(p1, 0.12, 0.2) });

        // ---- 레이어 스택 ----
        let wave = -9;
        if (p1 > 0.3 && p1 < 0.75) wave = L.lerp(-1.2, M.n + 0.2, L.sub(p1, 0.3, 0.72));
        const ma = A * (B ? L.ease(L.sub(p2, 0, 0.3)) : L.ease(L.sub(p1, 0.12, 0.3)));
        const dark = L.ease(L.sub(q2, 0.1, 0.45));
        const m = L.model({
          ...M, x: MX, alpha: ma, colors: (i) => L.mix(i % 2 ? FFN : ATT, '#0A0A0A', dark * 0.6),
          hl: (i) => bump(i - wave), hlColor: C.white, dials: 1 - dark * 0.6,
          dialAng: (i, r, c) => (L.rnd(i * 97 + r * 13 + c) - 0.5) * 5 + 0.1 * Math.sin(T + i + r + c),
        });
        if (!B) {
        const inX = TX + 180, inX1 = m.left[0] - 12;
        L.arrow(inX, M.y, inX1, M.y, L.ease(L.sub(p1, 0.2, 0.3)), { color: C.grey, alpha: A });
        L.comet((t) => [L.lerp(inX, inX1, t), M.y], L.sub(p1, 0.22, 0.32), { color: C.white, r: 18, alpha: A });
        // 레이어 라벨
        const cm = m.cam, spread = M.L * M.spread;
        const topOf = (i) => cm.p(-spread / 2 + ((i + 0.5) * spread) / M.n, M.h / 2, -M.d / 2);
        const la = A * L.ease(L.sub(p1, 0.28, 0.4)) * (1 - dark);
        const t0 = topOf(0), t1 = topOf(1);
        L.line(t0[0], t0[1] - 8, t0[0] - 60, t0[1] - 40, { color: C.blue, lw: 2, alpha: la });
        L.text('어텐션', t0[0] - 90, t0[1] - 92, { size: 30, weight: 700, color: C.blue, align: 'center', alpha: la });
        L.line(t1[0], t1[1] - 8, t1[0] + 80, t1[1] - 70, { color: C.gold, lw: 2, alpha: la });
        L.text('피드포워드', t1[0] + 110, t1[1] - 122, { size: 30, weight: 700, color: C.gold, align: 'center', alpha: la });
        L.text('(문맥 읽기)', t0[0] - 90, t0[1] - 58, { size: 22, color: C.grey, align: 'center', alpha: la * 0.9 });
        L.text('(언어 패턴 저장)', t1[0] + 110, t1[1] - 88, { size: 22, color: C.grey, align: 'center', alpha: la * 0.9 });
        L.text('이 두 층이 짝을 지어 수십 번 반복', M.x, M.y + 205, { size: 26, weight: 600, color: C.dim, align: 'center', alpha: la });

        // ---- 출력: 벡터 → 확률 → 다음 단어 ----
        const ox0 = m.right[0] + 12;
        L.arrow(ox0, M.y, OUTV - 30, M.y, L.ease(L.sub(p1, 0.7, 0.78)), { color: C.grey, alpha: A });
        L.comet((t) => [L.lerp(ox0, OUTV - 30, t), M.y], L.sub(p1, 0.72, 0.8), { color: C.white, r: 18, alpha: A });
        stripV(OUTV, M.y, 42, A * L.ease(L.sub(p1, 0.76, 0.82)), 7);
        L.arrow(OUTV + 30, M.y, BX - 150, M.y, L.ease(L.sub(p1, 0.8, 0.86)), { color: C.grey, alpha: A });
        const bp = L.sub(p1, 0.84, 1);
        L.bars(BX, BY, ITEMS.map((it, i) => ({ ...it, hl: i === 0 && bp >= 1 })), bp, { gap: GAP, maxW: 210, size: 34, alpha: A * (1 - 0.35 * dark) });
        L.text('다음 단어 확률', BX + 60, BY - 70, { size: 24, color: C.grey, align: 'center', alpha: A * L.sub(p1, 0.84, 0.9) });
        }

        // ---- 블랙박스 ----
        if (q2 > 0) {
          const ba = A * L.ease(L.sub(q2, 0.1, 0.4));
          // 가운데를 어둡게
          const g = ctx.createRadialGradient(MX, M.y, 30, MX, M.y, 330);
          g.addColorStop(0, `rgba(0,0,0,${0.92 * ba})`); g.addColorStop(0.6, `rgba(0,0,0,${0.7 * ba})`); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g; ctx.fillRect(MX - 340, M.y - 340, 680, 680);
          // 얽힌 연결
          const la2 = ba * L.ease(L.sub(q2, 0.2, 0.5));
          for (let i = 0; i < NL; i++) {
            const x1 = MX - 230 + L.rnd(i * 3.3) * 460, y1 = M.y - 140 + L.rnd(i * 5.1) * 280;
            const x2 = MX - 230 + L.rnd(i * 7.7) * 460, y2 = M.y - 140 + L.rnd(i * 2.9) * 280;
            const cx = (x1 + x2) / 2 + (L.rnd(i * 1.3) - 0.5) * 200, cy = (y1 + y2) / 2 + (L.rnd(i * 4.4) - 0.5) * 200;
            const fl = 0.25 + 0.75 * Math.max(0, Math.sin(T * (1 + L.rnd(i) * 2) + i));
            L.pathLine(L.qbez(x1, y1, cx, cy, x2, y2), 0, 1, { color: i % 5 === 0 ? C.blue : '#8A8A8A', lw: 1.2, alpha: la2 * 0.35 * fl, n: 16 });
          }
          const qa = A * L.ease(L.sub(q2, 0.3, 0.55));
          L.text('?', MX, M.y + 10, { size: 230, font: 'serif', color: C.yellow, align: 'center', alpha: qa, glow: L.rgba(C.yellow, 0.55), blur: 50, scale: L.lerp(0.7, 1, L.back(L.sub(q2, 0.3, 0.6))) });
          // 설명
          const n1 = A * L.ease(L.sub(q2, 0.5, 0.65)), n2 = A * L.ease(L.sub(q2, 0.6, 0.75)), n3 = A * L.ease(L.sub(q2, 0.7, 0.85));
          L.text('구조는 사람이 설계했지만', MX, 225, { size: 32, weight: 700, color: C.white, align: 'center', alpha: n1 });
          L.text('다이얼 값은 훈련이 자동으로 정한 수천억 개의 숫자', MX, 800, { size: 30, weight: 600, color: C.dim, align: 'center', alpha: n2 });
          if (B) {
            L.text('왜 하필 그 단어를 골랐을까?  →  만든 사람도 정확히 설명하기 어렵다', MX, 862, { size: 30, weight: 700, color: C.yellow, align: 'center', alpha: n3 });
          } else {
            L.text('왜 하필 \'내린다\'일까?', BX + 40, BY + GAP * 4 + 40, { size: 32, weight: 700, color: C.yellow, align: 'center', alpha: n3 });
            L.text('→ 정확히 설명하기 어렵다', BX + 40, BY + GAP * 4 + 88, { size: 26, color: C.dim, align: 'center', alpha: n3 });
          }
        }
      }

      // ---- 핵심 정리 ----
      const sa = L.ease(L.sub(p3, 0.15, 0.35));
      if (sa > 0) {
        L.writeText('정리', 960, 190, L.sub(p3, 0.15, 0.35), { size: 54, weight: 800, color: C.white, align: 'center' });
        (B ? SUMMARY_BASIC : SUMMARY).forEach((s, i) => {
          const a = L.ease(L.sub(p3, 0.25 + i * 0.11, 0.42 + i * 0.11));
          if (a <= 0) return;
          const y = 330 + i * 118, x = 330;
          L.circle(x - 60, y, 30, { stroke: C.grey, lw: 2, alpha: a });
          L.text(String(i + 1), x - 60, y + 2, { size: 32, font: 'serif', color: C.white, align: 'center', alpha: a });
          L.rich(s, x + (1 - a) * 20, y, { size: 40, weight: 500, alpha: a });
        });
      }

      if (!B) L.caption('문장 → 벡터 → [{b|어텐션} ↔ {o|피드포워드}] × 수십 층 → 확률 → {y|다음 단어}', L.vis(S, 1, 2, 0.35, 0.55, 0, 0.15));
      L.caption('그래서 LLM의 판단 과정은 {y|블랙박스}에 가깝다', L.vis(S, 2, 3, 0.55, 0.75, 0, 0.15));
    },
  });
})();
