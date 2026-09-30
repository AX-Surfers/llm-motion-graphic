/* 7. 트랜스포머 — 한 단어씩(순차) vs 문장 전체를 한 번에(병렬) */
(() => {
  const L = MG.lib, C = L.C;
  const WORDS = ['고객이', '더', '쉽게', '사용할', '수', '있게'];
  const X0 = 150, TS = 38;
  const TY = 330, SY = 450;      // 위 레인: 단어 / 상태 상자
  const BY = 720, LY = 845;      // 아래 레인: 단어 / 레이어
  const PX0 = 1330, PX1 = 1800;  // 오른쪽 진행 막대
  let pos = null;
  const layout = () => pos || (pos = L.layoutTiles(WORDS, X0, { size: TS, gap: 66 }));

  // 순차 처리 진행: t(0..1) 동안 6단어를 하나씩
  function seqState(t) { const k = t * WORDS.length; return { k: Math.floor(k), f: k - Math.floor(k) }; }

  function lane(label, sub, y, a) {
    L.text(label, 110, y, { size: 36, weight: 700, color: C.white, alpha: a });
    L.text(sub, 110 + L.tw(label, { size: 36, weight: 700 }) + 18, y + 3, { size: 28, color: C.grey, alpha: a });
  }
  function meter(y, frac, label, col, a, valText) {
    L.text(label, PX0, y - 40, { size: 24, color: C.grey, alpha: a });
    L.rect(PX0, y - 12, PX1 - PX0, 24, { fill: '#1A1A1A', stroke: C.grey3, lw: 1.5, r: 12, alpha: a });
    if (frac > 0) L.rect(PX0, y - 12, (PX1 - PX0) * L.clamp(frac), 24, { fill: col, r: 12, alpha: a });
    if (valText) L.text(valText, PX1, y - 40, { size: 26, font: 'serif', color: col, align: 'right', alpha: a });
  }

  MG.scene({
    id: 'transformer', only: 'full', title: ['7', '트랜스포머'],
    steps: [
      { d: 5.0, n: '예전: 한 단어씩 순서대로' },
      { d: 3.6, n: '트랜스포머: 문장 전체를 한 번에' },
      { d: 4.6, n: '같은 시간에 처리하는 양 비교' },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = L.st(S, 3);
      const ps = layout();

      // ================= 위 레인: 순차 =================
      const aTop = L.ease(L.sub(p1, 0, 0.18));
      lane('2017년 이전', '한 단어씩 순서대로 (순차 처리)', 215, aTop);
      // 1번 스텝: 한 번 / 3번 스텝: 다시 한 번(같은 속도)
      let tSeq = L.sub(p1, 0.15, 0.95);
      if (p3 > 0) tSeq = L.sub(p3, 0.08, 0.92);
      const { k, f } = seqState(tSeq);
      WORDS.forEach((w, i) => {
        const x = ps[i].x;
        const done = i < k || tSeq >= 1, act = i === k && tSeq < 1 && tSeq > 0;
        const glow = act ? Math.sin(Math.PI * L.clamp(f * 1.2)) : 0;
        L.tile(w, x, TY, { size: TS, alpha: aTop, stroke: act ? C.red : done ? C.grey : C.grey2, color: done || act ? C.white : C.grey, glow: act ? L.rgba(C.red, 0.5 * glow) : null });
        // 단어 → 상태
        const down = done ? 1 : act ? L.ease(L.sub(f, 0, 0.45)) : 0;
        L.arrow(x, TY + 32, x, SY - 28, down, { color: act ? C.red : C.grey2, lw: 3, head: 12, alpha: aTop });
        const lit = done ? 0.35 : act ? L.ease(L.sub(f, 0.35, 0.6)) : 0;
        L.rect(x - 24, SY - 24, 48, 48, { fill: L.mix('#161616', C.red, lit * 0.45), stroke: L.mix('#5E5E5E', C.red, lit), lw: 2, r: 8, alpha: aTop });
        // 상태 → 다음 상태
        if (i < WORDS.length - 1) {
          const nx = ps[i + 1].x;
          const right = done && i < k - 1 ? 1 : (i === k - 1 ? 1 : act ? L.ease(L.sub(f, 0.6, 1)) : 0);
          L.arrow(x + 26, SY, nx - 28, SY, i < k ? 1 : right, { color: C.grey, lw: 3, head: 12, alpha: aTop * (i < k || act ? 1 : 0.25) });
        }
      });
      L.text('앞 단어 처리가 끝나야 다음 단어로', ps[0].x - 30, SY + 62, { size: 24, color: C.grey, alpha: aTop * L.ease(L.sub(p1, 0.3, 0.5)) });

      // ================= 아래 레인: 병렬 =================
      const aBot = L.ease(L.sub(p2, 0, 0.18));
      lane('트랜스포머', '문장 전체를 한 번에 (병렬 처리)', 605, aBot);
      L.text('“Attention Is All You Need” · Google · 2017', 110, 652, { size: 24, font: 'serifI', color: C.grey, alpha: aBot });
      // 2번 스텝: 한 번에 / 3번 스텝: 같은 시간에 여러 번
      let pulses = [];
      if (p2 > 0) pulses.push(L.sub(p2, 0.3, 0.62));
      const NB = 6;
      if (p3 > 0) { pulses = []; for (let j = 0; j < NB; j++) pulses.push(L.sub(L.sub(p3, 0.08, 0.92), j / NB, (j + 1) / NB)); }
      const cur = pulses.find((q) => q > 0 && q < 1);
      const q = cur === undefined ? (pulses.length && pulses[pulses.length - 1] >= 1 ? 1 : 0) : cur;
      const layerX0 = ps[0].x - ps[0].w / 2 - 20, layerX1 = ps[WORDS.length - 1].x + ps[WORDS.length - 1].w / 2 + 20;
      const act = cur !== undefined;
      const lit = act ? Math.sin(Math.PI * L.sub(q, 0.3, 0.9)) : 0;
      WORDS.forEach((w, i) => {
        const x = ps[i].x;
        L.tile(w, x, BY, { size: TS, alpha: aBot, stroke: act ? C.blue : C.grey, color: C.white, glow: act ? L.rgba(C.blue, 0.4) : null });
        L.arrow(x, BY + 32, x, LY - 34, act ? L.ease(L.sub(q, 0, 0.35)) : (q >= 1 ? 1 : 0), { color: act ? C.blue : C.grey2, lw: 3, head: 12, alpha: aBot });
      });
      L.rect(layerX0, LY - 30, layerX1 - layerX0, 60, { fill: L.mix('#1A1A1A', C.blue, lit * 0.5), stroke: L.mix('#5E5E5E', C.blue, Math.max(lit, 0.3)), lw: 2, r: 12, alpha: aBot, glow: lit > 0.3 ? L.rgba(C.blue, 0.5 * lit) : null });
      L.text('트랜스포머 레이어', (layerX0 + layerX1) / 2, LY + 1, { size: 26, weight: 600, color: C.white, align: 'center', alpha: aBot });

      // ================= 오른쪽: 진행 막대 =================
      const done1 = p3 > 0 ? tSeq / 6 : tSeq; // 3번 스텝은 두 레인을 같은 눈금(6문장)으로 비교
      meter(SY - 20, done1, p3 > 0 ? '처리한 문장' : '걸린 시간', C.red, aTop, p3 > 0 ? (tSeq >= 1 ? '1문장' : '0문장') : null);
      if (aBot > 0) {
        if (p3 > 0) {
          const nDone = pulses.filter((v) => v >= 1).length;
          meter(BY + 40, pulses.reduce((s, v) => s + v, 0) / NB, '처리한 문장', C.blue, aBot, `${nDone}문장`);
        } else {
          meter(BY + 40, L.sub(p2, 0.3, 0.62) / WORDS.length, '걸린 시간', C.blue, aBot, null);
        }
      }
      if (p3 > 0.95) {
        const a = L.ease(L.sub(p3, 0.93, 1));
        L.text('×6', PX1 + 70, BY + 30, { size: 60, font: 'serif', color: C.yellow, align: 'center', alpha: a, glow: L.rgba(C.yellow, 0.5) });
      }

      L.caption('예전: 한 단어씩 {r|순서대로} → 속도를 높이기 어려움', L.vis(S, 1, 2, 0.4, 0.6, 0, 0.15));
      L.caption('트랜스포머: 문장 전체를 {b|한 번에} 처리', L.vis(S, 2, 3, 0.25, 0.45, 0, 0.15));
      L.caption('{b|GPU 병렬 계산}을 최대로 활용 → 훈련 속도가 {y|확} 빨라졌다', L.vis(S, 3, undefined, 0.2, 0.4));
    },
  });
})();
