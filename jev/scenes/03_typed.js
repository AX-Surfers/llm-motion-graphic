/* 2. Jev는 칸을 채워 줘요 — 상황 + 질문 → 정해진 칸에 담긴 답 → 프로그램이 바로 사용 */
(() => {
  const L = MG.lib, C = L.C, J = window.JV;
  const CARD = { x: 100, y: 215, w: 620, h: 240 };
  const QY = [590, 675, 760], QW = 620;
  const M = { x: 1000, y: 520, s: 60, yaw: 0.42, pitch: 0.24, label: 'Jev' };
  const TB = { x: 1250, y: 330, w: 590 };
  const PX = 1545, PY = 800;
  const ROWK = ['어느 팀?', '환불 요청?', '화난 정도'];

  MG.scene({
    id: 'typed', title: ['4', 'Jev는 칸을 채워 줘요'], titleBasic: ['3', 'Jev는 칸을 채워 줘요'],
    steps: [
      { d: 3.4, n: '상황 + 질문' },
      { d: 4.6, n: '답이 정해진 칸에 담겨 온다' },
      { d: 3.2, n: '프로그램이 바로 사용' },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = L.st(S, 3);

      // ---- 상황과 질문 ----
      L.fadeText('상황', CARD.x, 180, L.sub(p1, 0, 0.3), { size: 28, weight: 700, color: C.blue });
      J.msgCard(CARD.x, CARD.y, CARD.w, CARD.h, L.sub(p1, 0, 0.6), { header: false, size: 31 });
      L.fadeText('질문', CARD.x, 530, L.sub(p1, 0.4, 0.6), { size: 28, weight: 700, color: C.yellow });
      J.Q.forEach((q, i) => J.qCard(q, CARD.x, QY[i], QW, L.sub(p1, 0.45 + i * 0.12, 0.8 + i * 0.07)));

      // ---- Jev ----
      const glow = Math.sin(Math.PI * L.sub(p2, 0.2, 0.55));
      const m = L.model({ ...M, alpha: L.ease(L.sub(p2, 0, 0.25)), hlShell: glow, hlColor: C.yellow });
      const inA = L.cbez(CARD.x + CARD.w + 14, CARD.y + CARD.h / 2, 800, CARD.y + CARD.h / 2, 820, M.y - 20, m.left[0] - 12, M.y - 12);
      const inB = L.cbez(CARD.x + QW + 14, QY[1], 800, QY[1], 820, M.y + 20, m.left[0] - 12, M.y + 12);
      const lp = L.ease(L.sub(p2, 0.05, 0.25));
      L.pathLine(inA, 0, lp, { color: C.grey, lw: 3, head: 16 });
      L.pathLine(inB, 0, lp, { color: C.grey, lw: 3, head: 16 });
      L.comet(inA, L.sub(p2, 0.08, 0.3), { color: C.blue, r: 16 });
      L.comet(inB, L.sub(p2, 0.08, 0.3), { color: C.yellow, r: 16 });

      // ---- 답 표 ----
      const fly = J.Q.map((_, i) => L.sub(p2, 0.5 + i * 0.1, 0.7 + i * 0.1));
      const rows = J.Q.map((q, i) => ({ k: ROWK[i], v: q.ans, c: q.c, num: q.num, f: L.ease(L.sub(fly[i], 0.85, 1)) }));
      const done = L.ease(L.sub(p3, 0.4, 0.7));
      const tb = J.table(TB.x, TB.y, TB.w, rows, L.sub(p2, 0.25, 0.55), { glow: done > 0 ? L.rgba(C.green, 0.35 * done) : null });
      const ox0 = m.right[0] + 12, ox1 = TB.x - 16;
      L.arrow(ox0, M.y, ox1, M.y, L.ease(L.sub(p2, 0.35, 0.5)), { color: C.grey });
      J.Q.forEach((q, i) => {
        const f = fly[i];
        if (f <= 0 || f >= 1) return;
        const ty = tb.rowY(i);
        const path = L.cbez(ox0, M.y, ox0 + 140, M.y, tb.valX - 160, ty, tb.valX, ty);
        const [x, y] = path(L.ease(f));
        L.tile(q.ans, x, y, { size: 32, color: q.c, stroke: q.c, fill: 'rgba(20,20,20,0.95)', glow: L.rgba(q.c, 0.5), scale: 0.7 + 0.3 * L.back(L.sub(f, 0, 0.4)) });
      });

      // ---- 3: 프로그램이 바로 가져다 쓴다 ----
      const ay0 = TB.y + tb.H + 12, ay1 = PY - 64;
      L.arrow(PX, ay0, PX, ay1, L.ease(L.sub(p3, 0.05, 0.3)), { color: C.grey });
      L.comet((t) => [PX, L.lerp(ay0, ay1, t)], L.sub(p3, 0.12, 0.4), { color: C.green, r: 16 });
      J.prog(PX, PY, L.sub(p3, 0, 0.3), { glow: done > 0.5 ? C.green : null });
      J.check(PX + 150, PY - 4, 64, L.sub(p3, 0.45, 0.75), C.green);
      L.fadeText('해석 없이 바로 실행', PX - 140, PY, L.sub(p3, 0.55, 0.85), { size: 32, weight: 700, color: C.green, align: 'right' });

      L.caption('Jev에는 {b|상황} + {y|질문}을 함께 보내요', J.cap(S, 1, 2));
      L.caption('답이 {y|정해진 칸}에 담겨서 와요', J.cap(S, 2, 3));
      L.caption('그래서 프로그램이 {g|바로} 쓸 수 있어요', J.cap(S, 3));
    },
  });
})();
