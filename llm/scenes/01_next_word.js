/* 1. 다음 단어 예측 — 회의록 빈칸을 한 단어씩 채운다 */
(() => {
  const CARD = { x: 110, y: 290, w: 730, h: 440 };
  const FS = 36;
  const BW = ['고객이', '더', '쉽게', '사용할', '수', '있게', '만드는', '것입니다.'];
  const M = { x: 1235, y: 505, yaw: 0.42, pitch: 0.24, label: 'LLM' };
  const OUT = { x: 1705, y: 505 };
  let lay = null;
  const layout = (L) => {
    if (lay) return lay;
    const sp = L.tw(' ', { size: FS });
    let x = 214, y = 590;
    lay = BW.map((w) => {
      const ww = L.tw(w, { size: FS });
      if (x + ww > 805) { x = 214; y += 54; }
      const r = { x, y, w: ww }; x += ww + sp; return r;
    });
    return lay;
  };
  // 4번 스텝: 단어가 점점 빨리 이어지도록 구간을 나눈다
  const K = BW.length - 1;
  const wts = [...Array(K)].map((_, k) => Math.pow(0.8, k));
  const tot = wts.reduce((s, v) => s + v, 0);
  const bounds = [0]; wts.forEach((w) => bounds.push(bounds[bounds.length - 1] + w / tot));

  MG.scene({
    id: 'next-word', title: ['1', '다음 단어 예측'],
    steps: [
      { d: 2.6, n: '회의록 (B의 답이 비어 있다)' },
      { d: 2.2, n: '다음 단어를 맞히는 기계' },
      { d: 3.4, n: '첫 단어 예측' },
      { d: 6.2, n: '한 단어씩 이어 붙이며 반복' },
    ],
    draw(S, T) {
      const L = MG.lib, C = L.C;
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = L.st(S, 3), p4 = L.st(S, 4);
      const ly = layout(L);

      // 각 단어의 진행도 (0..1, 1 = 회의록에 들어감)
      const q = BW.map((_, i) => {
        if (i === 0) return p3;
        const t = L.sub(p4, 0.1, 1);
        return L.sub(t, bounds[i - 1], bounds[i]);
      });

      // ---- 회의록 카드 ----
      L.rect(CARD.x, CARD.y, CARD.w, CARD.h, { fill: 'rgba(255,255,255,0.035)', alpha: L.ease(L.sub(p1, 0.3, 0.7)), r: 18 });
      L.rect(CARD.x, CARD.y, CARD.w, CARD.h, { stroke: C.grey, lw: 2, r: 18, draw: L.ease(L.sub(p1, 0, 0.5)) });
      L.writeText('회의록', 150, 343, L.sub(p1, 0.12, 0.42), { size: 30, weight: 700, color: C.white });
      L.line(150, 383, 150 + 650 * L.ease(L.sub(p1, 0.25, 0.55)), 383, { color: C.grey2, lw: 1.5 });
      const aA = L.ease(L.sub(p1, 0.32, 0.52));
      L.circle(172, 445, 23, { fill: C.blue, alpha: aA });
      L.text('A', 172, 446, { size: 25, weight: 800, color: '#000', align: 'center', alpha: aA });
      L.writeText('이번 프로젝트의 핵심 목표는', 214, 445, L.sub(p1, 0.38, 0.78), { size: FS });
      L.writeText('무엇인가요?', 214, 497, L.sub(p1, 0.55, 0.88), { size: FS });
      const aB = L.ease(L.sub(p1, 0.7, 0.92));
      L.circle(172, 590, 23, { fill: C.yellow, alpha: aB });
      L.text('B', 172, 591, { size: 25, weight: 800, color: '#000', align: 'center', alpha: aB });

      // 회의록에 이미 들어간 단어
      let lastIn = -1;
      BW.forEach((w, i) => {
        if (q[i] < 1) return;
        lastIn = i;
        L.text(w, ly[i].x, ly[i].y, { size: FS, color: C.text });
      });
      // 커서
      if (p1 >= 1 && lastIn < BW.length - 1) {
        const cx = lastIn < 0 ? 214 : ly[lastIn].x + ly[lastIn].w + 8;
        const cy = lastIn < 0 ? 590 : ly[lastIn].y;
        L.line(cx, cy - 20, cx, cy + 20, { color: C.yellow, lw: 3, alpha: Math.sin(T * 6) > 0 ? 1 : 0.15 });
      }

      // ---- 모델 ----
      const mA = L.ease(L.sub(p2, 0, 0.45));
      let glow = 0;
      BW.forEach((_, i) => { glow = Math.max(glow, Math.sin(Math.PI * L.sub(q[i], 0.18, 0.6))); });
      const m = L.model({ ...M, s: 92 * (0.8 + 0.2 * L.back(L.sub(p2, 0, 0.55))), alpha: mA, hlShell: glow, hlColor: C.yellow });
      const inX0 = 862, inX1 = m.left[0] - 16, outX0 = m.right[0] + 16, outX1 = OUT.x - 110;
      L.arrow(inX0, M.y, inX1, M.y, L.ease(L.sub(p2, 0.35, 0.7)), { color: C.grey, lw: 4 });
      L.arrow(outX0, M.y, outX1, M.y, L.ease(L.sub(p2, 0.55, 0.9)), { color: C.grey, lw: 4 });

      // 반복 화살표 (4번 스텝)
      const lp = L.ease(L.sub(p4, 0, 0.14)) * (1 - L.ease(L.sub(p4, 0.93, 1)) * 0.6);
      if (lp > 0) {
        const f = L.cbez(OUT.x, M.y + 62, OUT.x + 20, 880, 900, 880, 905, M.y + 34);
        L.pathLine(f, 0, L.ease(L.sub(p4, 0, 0.14)), { color: C.grey, lw: 3, dash: [10, 10], head: 18, alpha: lp });
        L.text('반복', (OUT.x + 905) / 2, 848, { size: 30, weight: 600, color: C.grey, align: 'center', alpha: lp });
      }

      // ---- 한 번의 예측 사이클 ----
      const inF = (t) => [L.lerp(inX0, inX1, t), M.y];
      const outF = (t) => [L.lerp(outX0, outX1, t), M.y];
      BW.forEach((w, i) => {
        const t = q[i];
        if (t <= 0 || t >= 1) return;
        L.comet(inF, L.sub(t, 0, 0.26), { color: C.yellow, r: 20 });
        L.comet(outF, L.sub(t, 0.48, 0.64), { color: C.yellow, r: 20 });
        const pop = L.sub(t, 0.6, 0.72), fly = L.ease(L.sub(t, 0.74, 1));
        if (pop <= 0) return;
        const target = [ly[i].x + ly[i].w / 2, ly[i].y];
        const f = L.cbez(OUT.x, OUT.y, OUT.x - 120, 150, target[0] + 180, 180, target[0], target[1]);
        const [x, y] = fly > 0 ? f(fly) : [OUT.x, OUT.y];
        const sc = L.lerp(L.back(pop), FS / 46, fly);
        const bgA = 1 - L.sub(fly, 0.55, 1);
        L.tile(w, x, y, {
          size: 46, scale: sc, color: L.mix(C.yellow, C.text, L.sub(fly, 0.6, 1)),
          stroke: L.rgba(C.yellow, 0.8 * bgA), fill: `rgba(40,34,8,${0.92 * bgA})`, glow: bgA > 0.5 ? L.rgba(C.yellow, 0.35) : null,
        });
      });

      L.caption('문장을 넣으면 {y|다음에 올 단어}를 예측하는 기계', L.vis(S, 2, 4, 0.5, 0.9, 0, 0.12));
      L.caption('예측한 단어를 붙이고 → 다시 넣고 → {y|반복}', L.vis(S, 4, undefined, 0.12, 0.25));
    },
  });
})();
