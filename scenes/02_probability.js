/* 2. 확률로 단어를 고른다 */
(() => {
  const L = MG.lib, C = L.C;
  const FS = 42, X0 = 140, Y = 505;
  const SENT = '오늘 점심은 김치찌개를';
  const M = { x: 1010, y: Y, yaw: 0.42, pitch: 0.24, s: 70, label: 'LLM' };
  const BX = 1440, BY = 380, GAP = 84, MAXW = 290;
  const ITEMS = [
    { w: '먹었다', v: 0.52, c: C.yellow },
    { w: '먹을까', v: 0.28, c: C.teal },
    { w: '주문했다', v: 0.15, c: C.blue },
    { w: '기타', v: 0.05, c: C.grey },
  ];
  const SEQ1 = [0, 1, 2, 0, 3, 1, 0, 2, 1, 0];
  const SEQ2 = [2, 0, 1, 3, 0, 2, 1, 0, 2, 1];
  const roul = (seq, r) => seq[Math.min(seq.length - 1, Math.floor(L.easeOut(r) * seq.length))];
  const cap = (S, a, b) => L.vis(S, a, b, 0.2, 0.45, 0, 0.18);

  function badge(n, x, y, a) {
    L.circle(x, y, 19, { stroke: C.grey, lw: 1.8, alpha: a });
    L.text(n, x, y + 1, { size: 24, font: 'serif', color: C.dim, align: 'center', alpha: a });
  }

  MG.scene({
    id: 'probability', title: ['2', '확률로 단어 고르기'],
    steps: [
      { d: 2.4, n: '미완성 문장' },
      { d: 3.0, n: '후보 단어마다 확률' },
      { d: 2.8, n: 'LLM = 확률 함수' },
      { d: 3.4, n: '확률에 따라 뽑기 ①' },
      { d: 3.8, n: '다시 뽑으면 ②' },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = L.st(S, 3), p4 = L.st(S, 4), p5 = L.st(S, 5);
      const sw = L.tw(SENT, { size: FS });
      const bx = X0 + sw + 16, bw = 160, bh = 66;

      // ---- 모델과 화살표 ----
      const mA = L.ease(L.sub(p1, 0.3, 0.8));
      const pulse = Math.max(Math.sin(Math.PI * L.sub(p2, 0.1, 0.45)), Math.sin(Math.PI * L.sub(p4, 0, 0.3)) * 0.6, Math.sin(Math.PI * L.sub(p5, 0.25, 0.5)) * 0.6);
      const m = L.model({ ...M, alpha: mA, hlShell: pulse, hlColor: C.yellow });
      const ax0 = bx + bw + 22, ax1 = m.left[0] - 14, ox0 = m.right[0] + 14, ox1 = BX - 175;
      L.arrow(ax0, Y, ax1, Y, L.ease(L.sub(p1, 0.55, 0.95)), { color: C.grey });
      L.arrow(ox0, Y, ox1, Y, L.ease(L.sub(p1, 0.65, 1)), { color: C.grey });
      L.comet((t) => [L.lerp(ax0, ax1, t), Y], L.sub(p2, 0, 0.2), { color: C.yellow, r: 18 });
      L.comet((t) => [L.lerp(ox0, ox1, t), Y], L.sub(p2, 0.22, 0.38), { color: C.yellow, r: 18 });

      // ---- 첫 번째 문장 (5번 스텝에서 위로 올라감) ----
      const up = L.ease(L.sub(p5, 0, 0.3));
      const y1 = L.lerp(Y, 318, up), a1 = L.lerp(1, 0.55, up);
      L.writeText(SENT, X0, y1, L.sub(p1, 0, 0.6), { size: FS, alpha: a1 });
      const fill1 = L.ease(L.sub(p4, 0.9, 1));
      L.rect(bx, y1 - bh / 2, bw, bh, { stroke: C.yellow, lw: 2.5, dash: [10, 8], r: 10, alpha: L.ease(L.sub(p1, 0.45, 0.8)) * (1 - fill1) });
      if (fill1 > 0) L.text('먹었다', bx + 6, y1, { size: FS, weight: 700, color: C.yellow, alpha: a1 });
      badge('1', 92, y1, up);

      // ---- 두 번째 문장 ----
      const a2 = L.ease(L.sub(p5, 0.15, 0.4));
      const fill2 = L.ease(L.sub(p5, 0.93, 1));
      if (a2 > 0) {
        L.text(SENT, X0, Y, { size: FS, alpha: a2 });
        L.rect(bx, Y - bh / 2, bw, bh, { stroke: C.teal, lw: 2.5, dash: [10, 8], r: 10, alpha: a2 * (1 - fill2) });
        if (fill2 > 0) L.text('먹을까', bx + 6, Y, { size: FS, weight: 700, color: C.teal });
        badge('2', 92, Y, a2);
      }

      // ---- 확률 막대 ----
      let sel = -1, selA = 0;
      const r1 = L.sub(p4, 0, 0.55), r2 = L.sub(p5, 0.35, 0.74);
      if (p5 > 0.35) { sel = roul(SEQ2, r2); selA = 1; }
      else if (p4 > 0) { sel = roul(SEQ1, r1); selA = 1 - L.sub(p5, 0, 0.2); }
      const settled = (p5 > 0.35 && r2 >= 1) || (p5 <= 0.35 && r1 >= 1);
      const items = ITEMS.map((it, i) => ({ ...it, hl: settled && i === sel }));
      L.bars(BX, BY, items, L.sub(p2, 0.35, 1), { gap: GAP, maxW: MAXW, size: 38 });
      if (sel >= 0 && selA > 0) {
        const col = settled ? (p5 > 0.35 ? C.teal : C.yellow) : C.white;
        L.rect(BX - 190, BY + sel * GAP - 37, 650, 74, { stroke: col, lw: 3, r: 12, alpha: selA, glow: settled ? L.rgba(col, 0.6) : null });
      }

      // ---- 뽑힌 단어가 빈칸으로 날아간다 ----
      const flyTo = (word, col, f, row, ty) => {
        if (f <= 0 || f >= 1) return;
        const e = L.ease(f);
        const sx = BX - L.tw(word, { size: 38, weight: 700 }) / 2, sy = BY + row * GAP;
        const tx = bx + 6 + L.tw(word, { size: FS, weight: 700 }) / 2;
        const path = L.cbez(sx, sy, sx - 200, sy - 260, tx + 260, ty - 260, tx, ty);
        const [x, y] = path(e);
        L.text(word, x, y, { size: L.lerp(38, FS, e), weight: 700, color: col, align: 'center', glow: L.rgba(col, 0.6) });
      };
      flyTo('먹었다', C.yellow, L.sub(p4, 0.6, 0.9), 0, Y);
      flyTo('먹을까', C.teal, L.sub(p5, 0.76, 0.93), 1, Y);

      // ---- 확률 함수 표기 ----
      const fa = L.vis(S, 3, 4, 0, 0.3, 0, 0.2);
      if (fa > 0) {
        const segs = [
          { t: 'P', o: { size: 60, font: 'math', color: C.white } },
          { t: '(', o: { size: 60, font: 'serif', color: C.white } },
          { t: '먹었다', o: { size: 46, weight: 700, color: C.yellow } },
          { t: '  |  ', o: { size: 56, font: 'serif', color: C.grey } },
          { t: '오늘 점심은 김치찌개를', o: { size: 42, color: C.dim } },
          { t: ')', o: { size: 60, font: 'serif', color: C.white } },
          { t: '  =  0.52', o: { size: 58, font: 'serif', color: C.white } },
        ];
        const ws = segs.map((s) => L.tw(s.t, s.o));
        let x = 960 - ws.reduce((a, b) => a + b, 0) / 2;
        const cx = [];
        segs.forEach((s, i) => {
          L.writeText(s.t, x, 205, L.sub(p3, i * 0.07, 0.45 + i * 0.07), Object.assign({ alpha: fa }, s.o));
          cx.push(x + ws[i] / 2); x += ws[i];
        });
        L.fadeText('다음 단어', cx[2], 272, L.sub(p3, 0.55, 0.85), { size: 26, color: C.yellow, align: 'center', alpha: fa });
        L.fadeText('앞 문장 (조건)', cx[4], 272, L.sub(p3, 0.62, 0.92), { size: 26, color: C.grey, align: 'center', alpha: fa });
        L.fadeText('확률', cx[6] + 30, 272, L.sub(p3, 0.69, 0.99), { size: 26, color: C.grey, align: 'center', alpha: fa });
      }

      L.caption('다음 단어 후보마다 {y|확률}을 매긴다', cap(S, 2, 3));
      L.caption('LLM = 다음 단어의 확률을 계산하는 {b|함수}', cap(S, 3, 4));
      L.caption('보통은 1등, 가끔은 2·3등도 — {y|확률에 따라} 뽑는다', cap(S, 4, 5));
      L.caption('그래서 같은 질문에도 답이 {y|조금씩 달라진다}', cap(S, 5));
    },
  });
})();
