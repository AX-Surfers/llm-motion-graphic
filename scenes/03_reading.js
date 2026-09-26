/* 3. 엄청난 양의 글을 읽었다 — 사람이 읽으면 2,600년 */
(() => {
  const L = MG.lib, C = L.C;
  const M = { x: 1400, y: 500, yaw: 0.5, pitch: 0.26, s: 100, label: 'LLM' };
  const AX0 = 170, AX1 = 1750, AY = 660;
  const START = -574; // 기원전 575년 (서기 0년은 없음)
  const NOW = 2026;
  const yearX = (y) => AX0 + ((y - START) / (NOW - START)) * (AX1 - AX0);
  const fmtYear = (y) => (y > 0 ? `${y}년` : `기원전 ${1 - y}년`);
  const MARKS = [
    { y: -550, label: '공자 탄생', sub: '기원전 551년' },
    { y: 1, label: '서기 1년', sub: '' },
    { y: 1443, label: '훈민정음 창제', sub: '1443년' },
  ];
  const TAGS = ['책', '뉴스', '위키백과', '논문', '블로그', '코드', '대본', '게시판', '백과사전', '매뉴얼'];
  const NP = 150;
  const comma = (n) => n.toLocaleString('en-US');

  MG.scene({
    id: 'reading', title: ['3', '엄청난 양의 글'],
    steps: [
      { d: 3.4, n: '인터넷의 글이 쏟아져 들어간다' },
      { d: 5.4, n: '사람이 읽는다면? (연표 거슬러 오르기)' },
      { d: 3.6, n: '2,600년 동안 쉬지 않고' },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = L.st(S, 3);

      // ---- 1. 글 스트림 → 모델 ----
      const sa = L.vis(S, 1, 2, 0, 0.4, 0, 0.35);
      if (sa > 0) {
        const tgt = L.model({ ...M, alpha: 0 }).left;
        const dens = L.ease(L.sub(p1, 0.05, 0.75));
        for (let i = 0; i < NP; i++) {
          if (i / NP > dens) continue;
          const sp = 0.13 + L.rnd(i * 7.3) * 0.12;
          const t = (T * sp + L.rnd(i * 1.7)) % 1;
          const y0 = 150 + L.rnd(i * 3.1) * 780;
          const f = L.cbez(-90, y0, 420, y0, 820, L.lerp(y0, tgt[1], 0.75), tgt[0] + 30, tgt[1]);
          const [x, y] = f(t);
          const s = L.lerp(1, 0.25, t * t);
          const a = sa * L.sub(t, 0, 0.08) * (1 - L.sub(t, 0.82, 0.97));
          if (a <= 0.01) continue;
          const col = i % 11 === 0 ? C.blue : i % 13 === 0 ? C.yellow : C.grey;
          L.doc(x, y, 30 * s, 38 * s, { color: col, alpha: a, lines: 3 });
          if (i % 15 === 0 && t < 0.6) L.text(TAGS[(i / 15) % TAGS.length], x, y - 34 * s, { size: 22, color: C.dim, align: 'center', alpha: a * (1 - L.sub(t, 0.35, 0.6)) });
        }
        L.model({ ...M, alpha: sa * L.ease(L.sub(p1, 0, 0.4)), hlShell: 0.35 + 0.25 * Math.sin(T * 3.2), hlColor: C.blue });
        L.caption('인터넷의 {y|방대한 글}을 읽으며 다음 단어 맞히기를 연습했다', L.vis(S, 1, 2, 0.35, 0.7, 0, 0.2));
      }

      // ---- 2. 연표 ----
      const ta = L.vis(S, 2, undefined, 0.15, 0.35);
      if (ta <= 0) return;
      L.writeText('GPT-3가 읽은 글을 사람이 읽는다면?', 960, 215, L.sub(p2, 0.1, 0.4), { size: 50, weight: 700, align: 'center', color: C.white });

      const ad = L.ease(L.sub(p2, 0.18, 0.36));
      L.line(AX1 - (AX1 - AX0) * ad, AY, AX1, AY, { color: C.grey, lw: 3, alpha: ta });
      // 지금 (오른쪽 끝)
      L.line(AX1, AY - 16, AX1, AY + 16, { color: C.white, lw: 3, alpha: ta });
      L.text('지금', AX1, AY + 52, { size: 30, weight: 700, color: C.white, align: 'center', alpha: ta });
      L.text('2026년', AX1, AY + 88, { size: 24, color: C.grey, align: 'center', alpha: ta });

      const h = L.easeInOut(L.sub(p2, 0.36, 0.96));
      const headY = L.lerp(NOW, START, h), hx = yearX(headY);
      // 거슬러 올라간 구간
      if (h > 0) L.line(hx, AY, AX1, AY, { color: C.yellow, lw: 6, alpha: ta * 0.85 });
      // 역사 표지
      MARKS.forEach((mk) => {
        const a = ta * L.ease(L.clamp((mk.y - headY) / 15));
        if (a <= 0) return;
        const x = yearX(mk.y);
        L.line(x, AY - 12, x, AY + 12, { color: C.white, lw: 2.5, alpha: a });
        L.text(mk.label, x, AY + 52, { size: 28, weight: 600, color: C.text, align: 'center', alpha: a });
        if (mk.sub) L.text(mk.sub, x, AY + 88, { size: 22, color: C.grey, align: 'center', alpha: a });
      });
      // 머리(되감기 커서)
      const headA = ta * L.sub(p2, 0.33, 0.4) * (1 - L.ease(L.sub(p3, 0, 0.25)));
      if (headA > 0) {
        L.line(hx, AY - 34, hx, AY + 18, { color: C.yellow, lw: 3, alpha: headA });
        L.glowDot(hx, AY, 20, C.yellow, headA);
        L.text(fmtYear(Math.round(headY) || 1), hx, AY - 64, { size: 30, weight: 700, color: C.yellow, align: 'center', alpha: headA });
      }
      // 기원전 575년 (왼쪽 끝)
      const la = ta * L.sub(p2, 0.95, 1);
      L.line(AX0, AY - 16, AX0, AY + 16, { color: C.yellow, lw: 3, alpha: la });

      // 큰 숫자
      const years = Math.round(2600 * h);
      const na = ta * L.ease(L.sub(p2, 0.3, 0.42));
      if (na > 0) {
        const glow = L.ease(L.sub(p3, 0, 0.3));
        const numStr = comma(years), nw = L.tw(numStr, { size: 150, font: 'serif' }), yw = L.tw('년', { size: 90, weight: 700 });
        const x0 = 960 - (nw + 12 + yw) / 2;
        const col = L.mix(C.white, C.yellow, Math.max(h > 0.999 ? 1 : 0, glow));
        L.text(numStr, x0, 430, { size: 150, font: 'serif', color: col, alpha: na, glow: glow > 0 ? L.rgba(C.yellow, 0.45 * glow) : null, blur: 40 });
        L.text('년', x0 + nw + 12, 448, { size: 90, weight: 700, color: col, alpha: na });
      }

      // ---- 3. 한 사람이 쉬지 않고 읽어 온다 ----
      const ra = L.ease(L.sub(p3, 0.05, 0.3));
      if (ra > 0) {
        const rp = L.easeInOut(L.sub(p3, 0.25, 0.95));
        const rx = L.lerp(AX0, AX1, rp);
        L.line(AX0, AY, rx, AY, { color: C.blue, lw: 6, alpha: ra, });
        L.person(rx, AY - 70, 44, { color: C.blue, alpha: ra });
        L.doc(rx + 22, AY - 56, 18, 24, { color: C.white, alpha: ra, lines: 2 });
        L.glowDot(rx, AY, 16, C.blue, ra);
        L.fadeText('기원전 575년부터 읽기 시작 →', AX0 - 20, AY - 160, L.sub(p3, 0.08, 0.3), { size: 28, weight: 600, color: C.blue, align: 'left' });
      }

      L.caption('하루 24시간, {y|한순간도 쉬지 않고} 읽어야 하는 양', L.vis(S, 2, 3, 0.4, 0.6, 0, 0.18));
      L.caption('공자가 태어나기 전부터 읽기 시작해야 {y|지금} 끝난다 — 최신 모델은 이보다 훨씬 더 많이 읽었다', L.vis(S, 3, undefined, 0.2, 0.45), { size: 36 });
    },
  });
})();
