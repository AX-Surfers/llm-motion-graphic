/* 여러 장면이 같이 쓰는 재료: 고객 메시지, 질문 카드, 프로그램 상자, 답 표, 체크 표시 */
(() => {
  const L = MG.lib, C = L.C;
  const J = (window.JV = {});

  // 문서(docs.typesafe.ai/primitives) Noul 예시 메시지를 우리말로 옮긴 것
  J.MSG = ['주문 A-104가 두 번 결제됐어요.', '중복된 건은 환불해 주세요.', '벌써 두 번째 문의예요.'];
  // 같은 메시지에 던지는 질문 세 개 (문서 예시: department / refund 요청 / frustration)
  J.Q = [
    { name: 'Choice', ko: '어느 팀이 맡을까?', short: '어느 팀?', c: C.yellow, ans: '결제' },
    { name: 'Noul', ko: '환불을 원하나?', short: '환불 요청?', c: C.pink, ans: '0.97', num: true },
    { name: 'Score', ko: '얼마나 화났나?', short: '화난 정도', c: C.teal, ans: '짜증' },
  ];
  J.cap = (S, a, b) => L.vis(S, a, b, 0.2, 0.45, 0, 0.15);

  // 고객 메시지 카드. p: 등장 진행도
  J.msgCard = (x, y, w, h, p, o = {}) => {
    const a = o.alpha === undefined ? 1 : o.alpha;
    if (a <= 0.003 || p <= 0) return;
    const lines = o.lines || J.MSG, fs = o.size || 32;
    L.rect(x, y, w, h, { fill: 'rgba(255,255,255,0.035)', r: 18, alpha: a * L.ease(L.sub(p, 0.3, 0.7)) });
    L.rect(x, y, w, h, { stroke: o.stroke || C.grey, lw: 2, r: 18, draw: L.ease(L.sub(p, 0, 0.5)), alpha: a });
    let ty = y + h / 2 - ((lines.length - 1) * fs * 1.6) / 2;
    if (o.header !== false) {
      const ha = a * L.ease(L.sub(p, 0.2, 0.5));
      L.person(x + 46, y + 50, 30, { color: C.blue, alpha: ha });
      L.text(o.title || '고객 메시지', x + 78, y + 48, { size: 28, weight: 700, color: C.white, alpha: ha });
      L.line(x + 30, y + 90, x + 30 + (w - 60) * L.ease(L.sub(p, 0.25, 0.55)), y + 90, { color: C.grey2, lw: 1.5, alpha: a });
      ty = y + 90 + (h - 90) / 2 - ((lines.length - 1) * fs * 1.6) / 2;
    }
    lines.forEach((s, i) => L.writeText(s, x + 34, ty + i * fs * 1.6, L.sub(p, 0.35 + i * 0.15, 0.7 + i * 0.12), { size: fs, alpha: a, color: o.color || C.text }));
  };

  // 질문 카드: [종류 칩] 질문 문장
  J.qCard = (q, x, y, w, p, o = {}) => {
    const e = L.ease(L.sub(p, 0, 0.6));
    const a = (o.alpha === undefined ? 1 : o.alpha) * e;
    if (a <= 0.003) return;
    const h = o.h || 66, dx = (1 - e) * -30;
    L.rect(x + dx, y - h / 2, w, h, { fill: 'rgba(20,20,20,0.95)', stroke: L.rgba(q.c, 0.75), lw: 2, r: 12, alpha: a, glow: o.glow ? L.rgba(q.c, o.glow) : null });
    const cs = o.chip || 26;
    const cw = L.tw(q.name, { size: cs, font: 'serifI' }) + 26;
    L.rect(x + dx + 14, y - cs * 0.75, cw, cs * 1.5, { fill: L.rgba(q.c, 0.18), r: 8, alpha: a });
    L.text(q.name, x + dx + 14 + cw / 2, y + 1, { size: cs, font: 'serifI', color: q.c, align: 'center', alpha: a });
    L.text(o.text || q.ko, x + dx + 14 + cw + 18, y + 1, { size: o.size || 30, color: C.text, alpha: a });
  };

  // 답 칩: 왼쪽에 질문 이름, 오른쪽에 값
  J.ansChip = (q, x, y, w, p, o = {}) => {
    const e = L.ease(L.sub(p, 0, 0.6));
    const a = (o.alpha === undefined ? 1 : o.alpha) * e;
    if (a <= 0.003) return;
    const h = o.h || 66;
    L.rect(x, y - h / 2, w, h, { fill: L.rgba(q.c, 0.1), stroke: q.c, lw: 2.5, r: 12, alpha: a, glow: L.rgba(q.c, 0.4) });
    L.text(q.short, x + 24, y + 1, { size: 26, color: C.dim, alpha: a });
    L.text(q.ans, x + w - 24, y + 1, { size: 36, weight: 700, font: q.num ? 'serif' : undefined, color: q.c, align: 'right', alpha: a, scale: 1 });
  };

  // 프로그램 상자 ({ } 아이콘)
  J.prog = (x, y, p, o = {}) => {
    const a = (o.alpha === undefined ? 1 : o.alpha) * L.ease(L.sub(p, 0, 0.5));
    if (a <= 0.003) return;
    const w = o.w || 200, h = o.h || 110, s = 0.85 + 0.15 * L.back(L.sub(p, 0, 0.6));
    const gc = o.glow;
    L.rect(x - (w / 2) * s, y - (h / 2) * s, w * s, h * s, { fill: 'rgba(24,24,24,0.96)', stroke: gc || C.grey, lw: 2.5, r: 14, alpha: a, glow: gc ? L.rgba(gc, 0.5) : null });
    L.text('{ }', x, y - 14 * s, { size: 42 * s, font: 'serif', color: gc || C.dim, align: 'center', alpha: a });
    L.text('프로그램', x, y + 30 * s, { size: 22 * s, color: C.grey, align: 'center', alpha: a });
  };

  // 체크 표시 (그려지는 연출)
  J.check = (x, y, s, p, color, a = 1) => {
    if (p <= 0) return;
    const P = [[x - s * 0.5, y], [x - s * 0.15, y + s * 0.35], [x + s * 0.55, y - s * 0.4]];
    const f = (t) => (t < 0.4 ? [L.lerp(P[0][0], P[1][0], t / 0.4), L.lerp(P[0][1], P[1][1], t / 0.4)]
      : [L.lerp(P[1][0], P[2][0], (t - 0.4) / 0.6), L.lerp(P[1][1], P[2][1], (t - 0.4) / 0.6)]);
    L.pathLine(f, 0, L.ease(p), { color, lw: s * 0.14, alpha: a, glow: color });
  };

  // X 표시
  J.cross = (x, y, s, p, color, a = 1) => {
    if (p <= 0) return;
    const e = L.ease(p), h = s * 0.42;
    L.line(x - h, y - h, x - h + 2 * h * L.sub(e, 0, 0.5), y - h + 2 * h * L.sub(e, 0, 0.5), { color, lw: s * 0.13, alpha: a });
    if (e > 0.5) L.line(x + h, y - h, x + h - 2 * h * L.sub(e, 0.5, 1), y - h + 2 * h * L.sub(e, 0.5, 1), { color, lw: s * 0.13, alpha: a });
  };
  // 버전별 장면 번호: J.T(공학, 쉬운)
  J.full = () => MG.variant !== 'basic';

  // 답 표: rows = [{k, v, c, f(0~1 채워짐), num}]
  J.table = (x, y, w, rows, p, o = {}) => {
    const a = o.alpha === undefined ? 1 : o.alpha;
    const hh = 56, rh = o.rh || 80, H = hh + rh * rows.length, cx = x + w * (o.split || 0.5);
    const res = { cx, rowY: (i) => y + hh + rh * (i + 0.5), valX: (cx + x + w) / 2, H };
    if (a <= 0.003 || p <= 0) return res;
    L.rect(x, y, w, H, { fill: 'rgba(255,255,255,0.03)', r: 14, alpha: a * L.ease(L.sub(p, 0.2, 0.6)) });
    L.rect(x, y, w, H, { stroke: o.stroke || C.grey, lw: 2, r: 14, draw: L.ease(L.sub(p, 0, 0.6)), alpha: a, glow: o.glow || null });
    const la = a * L.ease(L.sub(p, 0.3, 0.8));
    L.line(x, y + hh, x + w, y + hh, { color: C.grey2, lw: 1.5, alpha: la });
    L.line(cx, y + 10, cx, y + H - 10, { color: C.grey3, lw: 1.5, alpha: la });
    L.text(o.h1 || '질문', (x + cx) / 2, y + hh / 2 + 1, { size: 24, color: C.grey, align: 'center', alpha: la });
    L.text(o.h2 || '답', res.valX, y + hh / 2 + 1, { size: 24, color: C.grey, align: 'center', alpha: la });
    rows.forEach((r, i) => {
      const yy = res.rowY(i);
      if (i > 0) L.line(x + 16, y + hh + rh * i, x + w - 16, y + hh + rh * i, { color: C.grey3, lw: 1, alpha: la });
      L.text(r.k, (x + cx) / 2, yy, { size: o.ks || 30, color: C.dim, align: 'center', alpha: la });
      const f = r.f || 0, bw = x + w - cx - 60;
      L.rect(cx + 30, yy - 26, bw, 52, { stroke: L.rgba(r.c, 0.55), lw: 2, dash: [8, 7], r: 10, alpha: la * (1 - f) });
      if (f > 0) {
        L.rect(cx + 30, yy - 26, bw, 52, { fill: L.rgba(r.c, 0.12), stroke: r.c, lw: 2, r: 10, alpha: a * f });
        L.text(r.v, res.valX, yy + 1, { size: o.vs || 34, weight: 700, font: r.num ? 'serif' : undefined, color: r.c, align: 'center', alpha: a * f });
      }
    });
    return res;
  };
})();
