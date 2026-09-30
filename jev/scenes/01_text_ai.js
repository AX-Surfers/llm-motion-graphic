/* 1. 보통 AI는 글로 답해요 — 프로그램이 그 글을 다시 읽고 해석해야 한다 */
(() => {
  const L = MG.lib, C = L.C, J = window.JV;
  const CARD = { x: 100, y: 330, w: 630, h: 320 };
  const M = { x: 955, y: 490, s: 62, yaw: 0.42, pitch: 0.24, label: 'AI' };
  const ANS = { x: 1180, y: 300, w: 660, h: 370 };
  const AL = ['고객님께서는 결제 과정에서 불편을', '겪으신 것 같고, 환불을 원하시는', '것으로 보입니다. 다만 주문 내역을', '먼저 확인해 보는 편이 좋을 수도…'];
  const LY = (i) => ANS.y + 140 + i * 56;
  const PX = 1510, PY = 850;

  MG.scene({
    id: 'text-ai', title: ['1', '보통 AI는 글로 답해요'], titleBasic: ['1', '보통 AI는 글로 답해요'],
    steps: [
      { d: 2.8, n: '고객 메시지' },
      { d: 4.8, n: '보통 AI는 긴 글로 답한다' },
      { d: 4.4, n: '프로그램이 글을 다시 읽고 해석' },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = L.st(S, 3);
      J.msgCard(CARD.x, CARD.y, CARD.w, CARD.h, p1);

      // ---- 모델 ----
      const glow = Math.sin(Math.PI * L.sub(p2, 0.12, 0.45));
      const m = L.model({ ...M, alpha: L.ease(L.sub(p2, 0, 0.3)), hlShell: glow, hlColor: C.blue });
      const ax0 = CARD.x + CARD.w + 18, ax1 = m.left[0] - 12, ox0 = m.right[0] + 12, ox1 = ANS.x - 16;
      L.arrow(ax0, M.y, ax1, M.y, L.ease(L.sub(p2, 0.05, 0.3)), { color: C.grey });
      L.arrow(ox0, M.y, ox1, M.y, L.ease(L.sub(p2, 0.3, 0.45)), { color: C.grey });
      L.comet((t) => [L.lerp(ax0, ax1, t), M.y], L.sub(p2, 0.08, 0.3), { color: C.blue, r: 18 });
      L.comet((t) => [L.lerp(ox0, ox1, t), M.y], L.sub(p2, 0.33, 0.47), { color: C.blue, r: 18 });

      // ---- AI의 답변 (긴 글이 한 글자씩) ----
      const ca = L.sub(p2, 0.38, 0.6);
      L.rect(ANS.x, ANS.y, ANS.w, ANS.h, { fill: 'rgba(88,196,221,0.05)', r: 18, alpha: L.ease(ca) });
      L.rect(ANS.x, ANS.y, ANS.w, ANS.h, { stroke: C.blue, lw: 2, r: 18, draw: L.ease(ca) });
      L.text('AI의 답변', ANS.x + 34, ANS.y + 48, { size: 28, weight: 700, color: C.blue, alpha: L.ease(L.sub(p2, 0.45, 0.6)) });
      L.line(ANS.x + 30, ANS.y + 90, ANS.x + 30 + (ANS.w - 60) * L.ease(L.sub(p2, 0.45, 0.62)), ANS.y + 90, { color: C.grey2, lw: 1.5 });
      AL.forEach((s, i) => {
        const q = L.sub(p2, 0.52 + i * 0.11, 0.63 + i * 0.11);
        const ch = [...s], n = Math.floor(ch.length * q);
        if (n > 0) L.text(ch.slice(0, n).join(''), ANS.x + 34, LY(i), { size: 29, color: C.text });
      });

      // ---- 3: 프로그램이 글을 한 줄씩 다시 읽는다 ----
      const u = L.sub(p3, 0.25, 0.85) * AL.length;
      if (p3 > 0.25 && p3 < 0.97) {
        const i = Math.min(AL.length - 1, Math.floor(u)), fr = Math.min(1, u - i);
        const lw = L.tw(AL[i], { size: 29 });
        L.rect(ANS.x + 26, LY(i) - 23, (lw + 16) * fr, 46, { fill: 'rgba(252,98,85,0.22)', r: 6 });
      }
      const pa = L.sub(p3, 0, 0.3);
      const confused = L.ease(L.sub(p3, 0.35, 0.6));
      const ay0 = ANS.y + ANS.h + 10, ay1 = PY - 66;
      L.arrow(PX, ay0, PX, ay1, L.ease(L.sub(p3, 0.05, 0.25)), { color: C.grey });
      L.comet((t) => [PX, L.lerp(ay0, ay1, t)], L.sub(p3, 0.1, 0.3), { color: C.blue, r: 16 });
      J.prog(PX, PY, pa, { glow: confused > 0.5 ? C.red : null });
      const bob = Math.sin(T * 3) * 5;
      L.text('?', PX + 132, PY - 36 + bob, { size: 70, weight: 800, color: C.red, alpha: confused, glow: L.rgba(C.red, 0.6) });
      L.text('?', PX + 172, PY + 10 - bob, { size: 44, weight: 800, color: C.red, alpha: confused * 0.7 });
      L.fadeText('어느 팀에 보내라는 거지?', PX - 140, PY - 26, L.sub(p3, 0.45, 0.7), { size: 30, color: C.red, align: 'right' });
      L.fadeText('환불해 주라는 거야, 말라는 거야?', PX - 140, PY + 30, L.sub(p3, 0.6, 0.85), { size: 30, color: C.red, align: 'right' });

      L.caption('고객이 이런 메시지를 보냈어요', J.cap(S, 1, 2));
      L.caption('보통 AI는 {b|긴 글}로 대답해요', J.cap(S, 2, 3));
      L.caption('프로그램은 그 글을 {r|다시 읽고 해석}해야 해요', J.cap(S, 3));
    },
  });
})();
