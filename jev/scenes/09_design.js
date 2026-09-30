/* 7. 잘 쓰는 법 — 질문은 하나씩 작게, 합치는 건 코드가 */
(() => {
  const L = MG.lib, C = L.C, J = window.JV;
  const SX = [400, 960, 1520], SY = 420, SW = 440;
  const ORDER = [0, 1, 2];
  const CODE = [
    '{d|팀} = {y|결제}',
    '{d|만약} 환불 > 0.9  →  {p|환불 절차 시작}',
    '{d|만약} 화남  →  {t|사과 문구 추가}',
  ];

  MG.scene({
    id: 'design', title: ['13', '잘 쓰는 법'], titleBasic: ['9', '잘 쓰는 법'],
    steps: [
      { d: 4.0, n: '큰 질문을 작은 질문으로 쪼갠다' },
      { d: 5.0, n: '작은 답을 코드가 합친다' },
      { d: 5.6, n: '세 가지 소프트웨어 구조', skipBasic: true },
      { d: 4.6, n: '전체 흐름 요약' },
    ],
    draw(S, T) {
      const full = MG.variant !== 'basic';
      const p1 = L.st(S, 1), p2 = L.st(S, 2), pA = full ? L.st(S, 3) : 0, p3 = L.st(S, 4);
      const out = 1 - L.ease(L.sub(full ? pA : p3, 0, 0.2));

      // ---- (공학) 세 가지 소프트웨어 구조 ----
      const aA = L.ease(L.sub(pA, 0.12, 0.3)) * (1 - L.ease(L.sub(p3, 0, 0.2)));
      if (aA > 0.003) {
        const COLS = [
          { x: 360, h: '전통 소프트웨어', s: '규칙만 — 말뜻은 모름', c: C.blue },
          { x: 960, h: 'LLM 에이전트', s: '매 반복마다 탈선 위험', c: C.purple },
          { x: 1560, h: 'AI 기반 소프트웨어', s: '흐름은 코드, 판단만 AI', c: C.yellow },
        ];
        COLS.forEach((K, j) => {
          const a = aA * L.ease(L.sub(pA, 0.15 + j * 0.2, 0.4 + j * 0.2));
          if (a <= 0.003) return;
          const hl = j === 2;
          L.rect(K.x - 270, 180, 540, 660, { fill: L.rgba(K.c, hl ? 0.06 : 0.02), stroke: K.c, lw: hl ? 3 : 2, r: 18, alpha: a, glow: hl ? L.rgba(K.c, 0.3) : null });
          L.text(K.h, K.x, 235, { size: 34, weight: 700, color: K.c, align: 'center', alpha: a });
          L.text(K.s, K.x, 790, { size: 26, color: C.dim, align: 'center', alpha: a });
          if (j === 1) {
            // 에이전트: 모델이 스스로 다음 행동을 고르며 도는 루프
            L.model({ x: K.x, y: 470, s: 50, yaw: 0.42, pitch: 0.24, label: 'LLM', alpha: a, hlShell: 0.3, hlColor: C.purple });
            const ang = T * 1.3;
            const f = (t) => [K.x + Math.cos(ang + t * 5.2) * 190, 490 + Math.sin(ang + t * 5.2) * 150];
            L.pathLine(f, 0, 1, { color: L.rgba(C.purple, 0.7), lw: 3, head: 16, alpha: a });
            ['계획', '실행', '확인'].forEach((w, k) => {
              const th = (k / 3) * Math.PI * 2 - Math.PI / 2;
              L.text(w, K.x + Math.cos(th) * 230, 490 + Math.sin(th) * 180, { size: 24, color: C.dim, align: 'center', alpha: a });
            });
            return;
          }
          // 순서도: 시작 → 판단 → 두 갈래
          const node = (x, y, t, col, o = {}) => {
            const w = L.tw(t, { size: 24 }) + 36;
            L.rect(x - w / 2, y - 26, w, 52, { fill: o.fill || 'rgba(20,20,20,0.95)', stroke: col, lw: 2, r: 10, alpha: a, glow: o.glow || null });
            L.text(t, x, y + 1, { size: 24, weight: o.bold ? 700 : 500, color: o.tc || C.text, align: 'center', alpha: a });
          };
          const ai = j === 2;
          node(K.x, 330, '문의 도착', C.grey);
          L.arrow(K.x, 358, K.x, 410, 1, { color: C.grey, lw: 2.5, alpha: a });
          if (ai) node(K.x, 440, 'Jev: 환불 요청? 0.97', C.yellow, { tc: C.yellow, bold: true, fill: 'rgba(40,34,8,0.95)', glow: L.rgba(C.yellow, 0.4) });
          else node(K.x, 440, "'환불' 글자가 있나?", C.blue);
          L.arrow(K.x - 30, 468, K.x - 130, 560, 1, { color: C.grey, lw: 2.5, alpha: a });
          L.arrow(K.x + 30, 468, K.x + 130, 560, 1, { color: C.grey, lw: 2.5, alpha: a });
          node(K.x - 140, 590, '환불 처리', C.green);
          node(K.x + 140, 590, '일반 상담', C.grey);
          if (ai) node(K.x, 690, '애매하면 사람에게', C.red, { tc: C.red });
          else node(K.x, 690, '“돈 돌려줘요” 놓침', C.red, { tc: C.red });
        });
      }

      if (out > 0.003) {
        // 큰 질문
        const bigA = out * L.ease(L.sub(p1, 0, 0.2)) * L.lerp(1, 0.45, L.ease(L.sub(p1, 0.35, 0.6)));
        L.rect(560, 190, 800, 84, { fill: 'rgba(255,255,255,0.04)', stroke: C.grey, lw: 2, r: 14, alpha: bigA });
        L.text('이 고객 문의, 어떻게 처리할까?', 960, 233, { size: 36, weight: 700, color: C.white, align: 'center', alpha: bigA });
        // 작은 질문 셋으로 쪼개기
        ORDER.forEach((qi, k) => {
          const q = J.Q[qi];
          const f = L.ease(L.sub(p1, 0.3 + k * 0.08, 0.7 + k * 0.08));
          if (f <= 0) return;
          const x = L.lerp(960, SX[k], f), y = L.lerp(233, SY, f);
          L.line(960, 276, x, y - 34, { color: C.grey2, lw: 2, alpha: out * f });
          J.qCard(q, x - SW / 2, y, SW, 1, { alpha: out * f, text: q.short, chip: 24 });
          // 답
          const aa = L.sub(p2, 0.05 + k * 0.08, 0.35 + k * 0.08);
          L.tile(q.ans, SX[k], 520, { size: 34, color: q.c, stroke: q.c, fill: 'rgba(20,20,20,0.95)', glow: L.rgba(q.c, 0.4), alpha: out * L.ease(aa), scale: 0.8 + 0.2 * L.back(aa) });
          // 코드 상자로 모인다
          const cf = L.cbez(SX[k], 556, SX[k], 620, 960 + (k - 1) * 120, 600, 960 + (k - 1) * 120, 640);
          L.pathLine(cf, 0, L.ease(L.sub(p2, 0.3, 0.5)), { color: L.rgba(q.c, 0.6), lw: 3, head: 14, alpha: out });
          L.comet(cf, L.sub(p2, 0.32, 0.52), { color: q.c, r: 14, alpha: out });
        });
        L.fadeText('질문 하나 = 딱 하나만 묻기', 960, 540, L.sub(p1, 0.8, 1), { size: 30, color: C.dim, align: 'center', alpha: out * (1 - L.ease(L.sub(p2, 0, 0.1))) });
        // 코드 상자
        const ca = out * L.ease(L.sub(p2, 0.4, 0.6));
        L.rect(560, 650, 720, 210, { fill: 'rgba(24,24,24,0.96)', stroke: C.grey, lw: 2, r: 14, alpha: ca });
        L.text('{ }  코드', 590, 684, { size: 22, color: C.grey, alpha: ca });
        CODE.forEach((s, i) => L.rich(s, 600, 730 + i * 46, { size: 30, alpha: out * L.ease(L.sub(p2, 0.5 + i * 0.08, 0.65 + i * 0.08)) }));
        const ra = out * L.ease(L.sub(p2, 0.8, 0.95));
        L.arrow(1300, 755, 1390, 755, L.ease(L.sub(p2, 0.78, 0.9)), { color: C.green, lw: 3, alpha: out });
        L.tile('결제팀 · 환불 처리', 1600, 755, { size: 32, color: C.green, stroke: C.green, fill: 'rgba(14,30,14,0.95)', glow: L.rgba(C.green, 0.4), alpha: ra });
      }

      // ---- 3: 전체 흐름 요약 ----
      if (p3 > 0.15) {
        const Y = 500;
        const g = (a, b) => L.ease(L.sub(p3, a, b));
        // 상황 + 질문
        const a1 = g(0.15, 0.35);
        L.rect(120, Y - 110, 360, 220, { fill: 'rgba(255,255,255,0.035)', stroke: C.grey, lw: 2, r: 16, alpha: a1 });
        L.person(170, Y - 58, 30, { color: C.blue, alpha: a1 });
        L.text('상황', 205, Y - 60, { size: 28, weight: 700, color: C.blue, alpha: a1 });
        J.Q.forEach((q, i) => L.text('· ' + q.short, 160, Y + 4 + i * 36, { size: 26, color: q.c, alpha: a1 }));
        L.text('상황 + 질문', 300, Y + 160, { size: 28, color: C.dim, align: 'center', alpha: a1 });
        // Jev
        const a2 = g(0.3, 0.5);
        const m = L.model({ x: 760, y: Y, s: 56, yaw: 0.42, pitch: 0.24, label: 'Jev', alpha: a2, hlShell: 0.3 + 0.2 * Math.sin(T * 1.6), hlColor: C.yellow });
        L.arrow(495, Y, m.left[0] - 10, Y, g(0.3, 0.45), { color: C.grey });
        L.text('빠른 판단', 760, Y + 160, { size: 28, color: C.dim, align: 'center', alpha: a2 });
        // 칸에 든 답
        const a3 = g(0.45, 0.65);
        L.arrow(m.right[0] + 10, Y, 1045, Y, g(0.45, 0.6), { color: C.grey });
        const rows = J.Q.map((q) => ({ k: q.short, v: q.ans, c: q.c, num: q.num, f: 1 }));
        J.table(1060, Y - 128, 380, rows, a3, { rh: 66, ks: 24, vs: 28, split: 0.48 });
        L.text('칸에 담긴 답', 1250, Y + 160, { size: 28, color: C.dim, align: 'center', alpha: a3 });
        // 프로그램
        const a4 = g(0.6, 0.8);
        L.arrow(1455, Y, 1560, Y, g(0.6, 0.72), { color: C.grey });
        J.prog(1680, Y, a4, { glow: C.green });
        J.check(1680, Y - 110, 50, L.sub(p3, 0.8, 0.95), C.green);
        L.text('바로 실행', 1680, Y + 160, { size: 28, color: C.dim, align: 'center', alpha: a4 });
      }

      L.caption('질문은 {y|하나에 하나만} 물어요', J.cap(S, 1, 2));
      L.caption('작은 답들을 합치는 건 {g|코드}가 해요', J.cap(S, 2, 3));
      if (full) L.caption('흐름은 {g|코드}가 쥐고, 말뜻 판단만 {y|AI}가', J.cap(S, 3, 4));
      L.caption('Jev = 소프트웨어가 {y|바로 쓰는} 빠른 판단', J.cap(S, 4));
    },
  });
})();
