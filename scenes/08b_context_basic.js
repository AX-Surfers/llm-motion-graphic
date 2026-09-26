/* 7(초보자). 문장을 통째로 한 번에 본다 — 트랜스포머를 비유 하나로 (어텐션은 초보자 버전에서 다루지 않음) */
(() => {
  const L = MG.lib, C = L.C;
  const S1 = ['밖에', '눈이', '많이', '내린다'];
  const FS = 50, TY = 400;

  MG.scene({
    id: 'context-basic', only: 'basic', title: ['7', '문장을 한 번에 읽기'],
    steps: [
      { d: 4.2, n: '문장을 통째로 한 번에 본다' },
    ],
    draw(S) {
      const p1 = L.st(S, 1);
      const a1 = L.ease(L.sub(p1, 0, 0.25));
      const lay = L.layoutTiles(S1, 960, { size: FS, gap: 16, align: 'center' });
      lay.forEach((ps, i) => L.tile(S1[i], ps.x, TY, { size: FS, alpha: a1, color: C.white, stroke: C.grey2 }));

      // 네 단어가 동시에 LLM 으로 들어간다
      const la = L.ease(L.sub(p1, 0.25, 0.45));
      const x0 = lay[0].x - lay[0].w / 2 - 30, x1 = lay[3].x + lay[3].w / 2 + 30;
      const q = L.sub(p1, 0.4, 0.75);
      const lit = Math.sin(Math.PI * L.sub(q, 0.3, 1));
      lay.forEach((ps) => L.arrow(ps.x, TY + 44, ps.x, 590, L.ease(L.sub(q, 0, 0.4)), { color: C.blue, lw: 4, head: 14, alpha: la }));
      L.rect(x0, 600, x1 - x0, 76, { fill: L.mix('#161616', C.blue, 0.15 + 0.45 * lit), stroke: C.blue, lw: 2.5, r: 16, alpha: la, glow: lit > 0.3 ? L.rgba(C.blue, 0.5 * lit) : null });
      L.text('LLM', 960, 640, { size: 34, font: 'serif', color: C.white, align: 'center', alpha: la });
      L.text('한 단어씩 차례로가 아니라, 네 단어를 동시에', 960, 745, { size: 30, weight: 600, color: C.dim, align: 'center', alpha: la * L.ease(L.sub(p1, 0.7, 0.9)) });

      L.caption('LLM은 문장을 한 단어씩이 아니라 {b|통째로 한 번에} 본다 → 그래서 빨리 배울 수 있다', L.vis(S, 1, undefined, 0.45, 0.65));
    },
  });
})();
