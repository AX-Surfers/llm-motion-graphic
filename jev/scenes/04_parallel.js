/* 한 번에 동시에 — 질문 여러 개를 한 번에 보내면 동시에 판단한다
   (공학) ③ 필요할지 모를 질문까지 미리 한 번에 → 코드가 골라 쓴다 */
(() => {
  const L = MG.lib, C = L.C, J = window.JV;
  const QX = 100, QW = 540;
  const M = { x: 960, y: 590, s: 64, yaw: 0.42, pitch: 0.24, label: 'Jev' };
  const MC = { x: 730, y: 160, w: 460, h: 170 };
  const AX = 1330, AW = 470;
  const Y3 = [340, 540, 740], Y5 = [250, 380, 510, 640, 770];
  const EXTRA = [
    { name: 'Noul', ko: '배송이 늦었나?', short: '배송 지연?', c: C.pink, ans: '0.04', num: true },
    { name: 'Choice', ko: '반품 사유는?', short: '반품 사유', c: C.yellow, ans: '변심' },
  ];

  MG.scene({
    id: 'parallel', title: ['6', '한 번에, 동시에'], titleBasic: ['4', '한 번에, 동시에'],
    steps: [
      { d: 3.8, n: '질문 셋을 한 번에 보낸다' },
      { d: 3.4, n: '답 셋이 동시에 돌아온다' },
      { d: 5.4, n: '필요할지 모를 질문도 미리 → 코드가 골라 쓴다', skipBasic: true },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = MG.variant === 'basic' ? 0 : L.st(S, 3);
      const sp = L.ease(L.sub(p3, 0, 0.3));
      const QS = [...J.Q, ...EXTRA];
      const qy = (i) => (i < 3 ? L.lerp(Y3[i], Y5[i], sp) : Y5[i]);

      J.msgCard(MC.x, MC.y, MC.w, MC.h, L.sub(p1, 0, 0.45), { header: false, size: 23, alpha: 1 - sp * 0.5 });
      const glow = Math.max(Math.sin(Math.PI * L.sub(p1, 0.62, 1.0)) * 0.9, Math.sin(Math.PI * L.sub(p2, 0, 0.3)) * 0.6, Math.sin(Math.PI * L.sub(p3, 0.35, 0.6)) * 0.8);
      const m = L.model({ ...M, alpha: L.ease(L.sub(p1, 0.05, 0.35)), hlShell: glow, hlColor: C.yellow });
      L.arrow(M.x, MC.y + MC.h + 10, M.x, M.y - 110, L.ease(L.sub(p1, 0.3, 0.5)), { color: C.grey, alpha: 1 - sp * 0.5 });

      QS.forEach((q, i) => {
        const extra = i >= 3;
        const ea = extra ? L.ease(L.sub(p3, 0.15, 0.4)) : 1;
        if (ea <= 0.003) return;
        const y = qy(i);
        const off = (i - (extra || sp > 0 ? 2 : 1)) * 12;
        const ignore = extra ? L.ease(L.sub(p3, 0.8, 0.95)) : 0;
        J.qCard(q, QX, y, QW, extra ? 1 : L.sub(p1, 0.05 + i * 0.08, 0.4 + i * 0.08), { alpha: ea, text: extra ? q.ko + '  (혹시 몰라서)' : undefined });
        const f = L.cbez(QX + QW + 14, y, 760, y, 780, M.y + off, m.left[0] - 10, M.y + off);
        L.pathLine(f, 0, extra ? L.ease(L.sub(p3, 0.25, 0.4)) : L.ease(L.sub(p1, 0.35, 0.55)), { color: L.rgba(q.c, 0.5), lw: 3, head: 14, alpha: ea });
        if (!extra) L.comet(f, L.sub(p1, 0.5, 0.75), { color: q.c, r: 16 });
        L.comet(f, L.sub(p3, 0.3, 0.5), { color: q.c, r: 16 });
        // 답
        const g = L.cbez(m.right[0] + 10, M.y + off, 1180, M.y + off, 1160, y, AX - 14, y);
        L.pathLine(g, 0, extra ? L.ease(L.sub(p3, 0.45, 0.6)) : L.ease(L.sub(p2, 0.05, 0.3)), { color: L.rgba(q.c, 0.5), lw: 3, head: 14, alpha: ea * (1 - ignore * 0.6) });
        if (!extra) L.comet(g, L.sub(p2, 0.1, 0.4), { color: q.c, r: 16 });
        L.comet(g, L.sub(p3, 0.45, 0.62), { color: q.c, r: 16 });
        J.ansChip(q, AX, y, AW, extra ? L.sub(p3, 0.55, 0.75) : L.sub(p2, 0.38, 0.7), { alpha: 1 - ignore * 0.65 });
        if (ignore > 0) {
          L.line(AX + 10, y, AX + 10 + (AW - 20) * ignore, y, { color: C.grey, lw: 3 });
        }
      });
      L.fadeText('요청 1번 · 동시에 판단', M.x, 760, L.sub(p2, 0.5, 0.85), { size: 28, color: C.dim, align: 'center', alpha: 1 - sp });
      L.fadeText('질문끼리 서로 영향 없음 · 추가해도 시간 거의 그대로', M.x, 860, L.sub(p3, 0.5, 0.7), { size: 26, color: C.dim, align: 'center' });
      L.fadeText('배송·반품 문의가 아니니 코드가 무시', AX + AW / 2, 850, L.sub(p3, 0.85, 1), { size: 24, color: C.grey, align: 'center' });

      L.caption('질문 여러 개를 {y|한 번에} 보내면', J.cap(S, 1, 2));
      L.caption('{y|동시에} 판단해서 한꺼번에 돌려줘요', J.cap(S, 2, 3));
      L.caption('필요할지 모를 질문도 {y|미리 한 번에} → 쓸지는 {g|코드}가 골라요', J.cap(S, 3));
    },
  });
})();
