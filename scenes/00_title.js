/* 0. 표지 */
MG.scene({
  id: 'title', title: null,
  steps: [{ d: 3.4, n: '제목' }],
  draw(S, T) {
    const L = MG.lib, C = L.C;
    const p = L.st(S, 1);
    L.model({
      x: 960, y: 330, s: 64, yaw: 0.55 + 0.12 * Math.sin(T * 0.5), pitch: 0.3,
      label: 'LLM', alpha: L.ease(L.sub(p, 0.3, 0.75)), hlShell: 0.25 + 0.2 * Math.sin(T * 1.4), hlColor: C.blue,
    });
    L.writeText('LLM은 어떻게 말을 할까?', 960, 575, L.sub(p, 0, 0.75), { size: 96, weight: 700, align: 'center', color: C.white });
    const u = L.ease(L.sub(p, 0.45, 0.85));
    L.line(960 - 330 * u, 655, 960 + 330 * u, 655, { color: C.grey2, lw: 1.5 });
    L.fadeText('Large Language Model', 960, 712, L.sub(p, 0.55, 0.95), { size: 40, font: 'serifI', align: 'center', color: C.grey });
  },
});
