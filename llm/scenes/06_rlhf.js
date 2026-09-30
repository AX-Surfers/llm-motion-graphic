/* 6. 글 잘 잇기(사전 훈련) ≠ 좋은 비서 → 사람 피드백(RLHF) */
(() => {
  const L = MG.lib, C = L.C;
  const PROMPT = '보고서 좀 요약해줘';
  const PY = 500;
  const M = { x: 800, y: PY, s: 58, yaw: 0.6, pitch: 0.3, explode: 1, n: 6, spread: 1.9, rows: 3, cols: 3 };
  const CONT = ' 그리고 회의록도 정리해줘. 발표 자료도 만들어 줘. 내일까지 메일로 보내 줘. 그리고 다음 주 일정도…';
  const OX = 1090, OW = 740;
  const bump = (x) => Math.exp(-x * x * 1.3);

  // 한 글자씩 타이핑되는 여러 줄 텍스트 (앞부분 dim, 뒷부분 main)
  function typeBlock(dimStr, mainStr, x, y, maxW, p, o) {
    const chars = [...dimStr].map((c) => [c, true]).concat([...mainStr].map((c) => [c, false]));
    const shown = Math.floor(dimStr.length + (chars.length - dimStr.length) * p);
    let cx = x, cy = y;
    const lh = o.size * 1.55;
    chars.forEach(([ch, dim], i) => {
      const w = L.tw(ch, { size: o.size });
      if (cx + w > x + maxW) { cx = x; cy += lh; if (ch === ' ') return; }
      if (i < shown) L.text(ch, cx, cy, { size: o.size, color: dim ? C.grey : C.text, alpha: o.alpha });
      cx += w;
    });
    if (p > 0 && p < 1) L.line(cx + 4, cy - o.size * 0.55, cx + 4, cy + o.size * 0.55, { color: C.white, lw: 3, alpha: o.alpha });
    return cy;
  }
  function bubble(str, x, y, o) {
    const w = L.tw(str, { size: o.size || 34, weight: 500 }) + 60, h = 78;
    L.rect(x, y - h / 2, w, h, { fill: o.fill || '#1C1C1C', stroke: o.stroke || C.grey2, lw: 2, r: 26, alpha: o.alpha });
    L.text(str, x + 30, y + 1, { size: o.size || 34, color: o.color || C.text, alpha: o.alpha });
    return w;
  }
  function check(x, y, s, a, col = C.green) {
    L.circle(x, y, s, { fill: L.rgba(col, 0.18), stroke: col, lw: 3, alpha: a });
    L.pathLine((t) => (t < 0.4 ? [L.lerp(x - s * 0.45, x - s * 0.1, t / 0.4), L.lerp(y, y + s * 0.35, t / 0.4)] : [L.lerp(x - s * 0.1, x + s * 0.48, (t - 0.4) / 0.6), L.lerp(y + s * 0.35, y - s * 0.38, (t - 0.4) / 0.6)]), 0, 1, { color: col, lw: 5, alpha: a, n: 20 });
  }
  function cross(x, y, s, a) {
    L.line(x - s, y - s, x + s, y + s, { color: C.red, lw: 5, alpha: a });
    L.line(x + s, y - s, x - s, y + s, { color: C.red, lw: 5, alpha: a });
  }
  function card(title, lines, x, y, w, h, o) {
    L.rect(x, y, w, h, { fill: '#141414', stroke: o.stroke || C.grey2, lw: 2, r: 16, alpha: o.alpha, glow: o.glow });
    L.text(title, x + 28, y + 38, { size: 26, weight: 700, color: o.titleColor || C.grey, alpha: o.alpha });
    lines.forEach((ln, i) => L.text(ln, x + 28, y + 88 + i * 44, { size: 29, color: o.color || C.text, alpha: o.alpha }));
  }

  MG.scene({
    id: 'rlhf', title: ['6', '좋은 비서가 되기까지'],
    steps: [
      { d: 4.6, n: '1단계 사전 훈련: 글만 이어 쓴다' },
      { d: 4.8, n: '2단계 사람 피드백 (RLHF)' },
      { d: 3.8, n: '좋은 AI 비서' },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = L.st(S, 3);

      // ---- 단계 제목 ----
      const h1 = L.vis(S, 1, 2, 0, 0.25, 0, 0.2), h2 = L.vis(S, 2, 3, 0.15, 0.35, 0, 0.2), h3 = L.vis(S, 3, undefined, 0.15, 0.35);
      const head = (a, b, sub, alpha, col) => {
        if (alpha <= 0) return;
        L.text(a, 110, 182, { size: 40, weight: 700, color: col, alpha });
        L.text(b, 110 + L.tw(a, { size: 40, weight: 700 }) + 18, 186, { size: 30, font: 'serifI', color: C.grey, alpha });
        if (sub) L.text(sub, 110, 236, { size: 28, color: C.dim, alpha });
      };
      head('1단계 · 사전 훈련', 'Pre-training', '인터넷 글로 다음 단어 맞히기를 연습한 상태', h1, C.white);
      head('2단계 · 사람 피드백', 'RLHF', '사람이 더 나은 답을 골라 준다', h2, C.white);
      head('사전 훈련 + 사람 피드백', '', '= 우리가 쓰는 ChatGPT · Claude', h3, C.white);

      // ---- 질문 말풍선 + 모델 ----
      const qa = L.ease(L.sub(p1, 0, 0.2));
      L.text('질문', 110, PY - 70, { size: 24, color: C.grey, alpha: qa });
      const bw = bubble(PROMPT, 110, PY, { alpha: qa });
      const adj = L.ease(L.sub(p2, 0.72, 0.95));
      let wave = -9, wcol = C.blue;
      if (p1 > 0.15 && p1 < 0.5) wave = L.lerp(-1.2, M.n + 0.2, L.sub(p1, 0.18, 0.42));
      if (p2 > 0.6 && p2 < 1) { wave = L.lerp(M.n + 0.2, -1.2, L.sub(p2, 0.66, 0.95)); wcol = C.green; }
      if (p3 > 0.1 && p3 < 0.5) wave = L.lerp(-1.2, M.n + 0.2, L.sub(p3, 0.12, 0.4));
      const m = L.model({
        ...M, alpha: L.ease(L.sub(p1, 0.05, 0.25)), hl: (i) => bump(i - wave), hlColor: wcol,
        dialAng: (i, r, c) => { const k = i * 97 + r * 13 + c; return (L.rnd(k) - 0.5) * 5 + (L.rnd(k + 3) - 0.5) * 2 * adj; },
      });
      const ax0 = 110 + bw + 18, ax1 = m.left[0] - 12;
      L.arrow(ax0, PY, ax1, PY, L.ease(L.sub(p1, 0.08, 0.2)), { color: C.grey });
      L.comet((t) => [L.lerp(ax0, ax1, t), PY], L.sub(p1, 0.1, 0.2), { color: C.blue, r: 18 });
      L.comet((t) => [L.lerp(ax0, ax1, t), PY], L.sub(p3, 0.02, 0.14), { color: C.blue, r: 18 });
      const ox0 = m.right[0] + 12;

      // ---- 1단계 출력: 글을 계속 이어 쓴다 ----
      const o1 = L.vis(S, 1, 2, 0.4, 0.5, 0, 0.2);
      if (o1 > 0) {
        L.arrow(ox0, PY, OX - 24, PY, L.ease(L.sub(p1, 0.4, 0.5)), { color: C.grey, alpha: o1 });
        L.text('출력', OX, PY - 150, { size: 24, color: C.grey, alpha: o1 * L.sub(p1, 0.45, 0.55) });
        const endY = typeBlock(PROMPT, CONT, OX, PY - 95, OW, L.sub(p1, 0.48, 0.9), { size: 34, alpha: o1 });
        const qa2 = o1 * L.ease(L.sub(p1, 0.88, 1));
        L.text('?', OX + 14, endY + 95, { size: 54, font: 'serif', color: C.yellow, align: 'center', alpha: qa2 });
        L.text('질문에 답하지 않고, 인터넷 글처럼 뒷말을 계속 이어 쓸 뿐', OX + 50, endY + 95, { size: 28, color: C.yellow, alpha: qa2 });
      }

      // ---- 2단계: 사람이 더 나은 답을 고른다 ----
      const c2 = L.vis(S, 2, 3, 0.15, 0.35, 0, 0.2);
      if (c2 > 0) {
        const cx = 1070, cw = 610;
        const aA = c2 * L.ease(L.sub(p2, 0.15, 0.3)), aB = c2 * L.ease(L.sub(p2, 0.22, 0.37));
        const pick = L.ease(L.sub(p2, 0.45, 0.58));
        card('답변 A', ['요약에는 여러 방법이 있습니다. 먼저 보고서의', '목적을 파악하고, 핵심 내용을 찾은 뒤…'], cx, 300, cw, 190, { alpha: aA * (1 - 0.55 * pick), color: C.dim, stroke: L.mix('#5E5E5E', C.red, pick) });
        card('답변 B', ['핵심만 3줄로 정리했어요.', '① 목표   ② 성과   ③ 다음 할 일'], cx, 530, cw, 190, { alpha: aB, stroke: L.mix('#5E5E5E', C.green, pick), titleColor: L.mix(C.grey, C.green, pick), glow: pick > 0.5 ? L.rgba(C.green, 0.35) : null });
        cross(cx + cw - 42, 340, 14, c2 * pick);
        check(cx + cw - 42, 570, 22, c2 * pick);
        // 평가자
        const pa = c2 * L.ease(L.sub(p2, 0.3, 0.45));
        L.person(1790, 505, 70, { color: C.dim, alpha: pa });
        L.text('사람 평가자', 1790, 610, { size: 24, color: C.grey, align: 'center', alpha: pa });
        L.arrow(1745, 520, cx + cw + 14, 600, L.ease(L.sub(p2, 0.42, 0.55)), { color: C.green, lw: 3, head: 14, alpha: c2 });
        // 피드백 → 모델
        const fb = L.cbez(cx + 40, 725, cx - 60, 860, M.x + 140, 860, M.x + 30, PY + 105);
        L.pathLine(fb, 0, L.ease(L.sub(p2, 0.55, 0.75)), { color: C.green, lw: 4, head: 18, alpha: c2 });
        L.text('이 방향으로 다이얼 재조정', (cx + M.x) / 2 + 30, 880, { size: 26, weight: 600, color: C.green, align: 'center', alpha: c2 * L.ease(L.sub(p2, 0.62, 0.75)) });
      }

      // ---- 3단계: 좋은 비서의 답 ----
      const o3 = L.vis(S, 3, undefined, 0.2, 0.35);
      if (o3 > 0) {
        L.arrow(ox0, PY, OX - 24, PY, L.ease(L.sub(p3, 0.3, 0.42)), { color: C.grey, alpha: o3 });
        L.comet((t) => [L.lerp(ox0, OX - 24, t), PY], L.sub(p3, 0.38, 0.5), { color: C.green, r: 18 });
        const ba = L.ease(L.sub(p3, 0.45, 0.62));
        L.text('출력', OX, PY - 140, { size: 24, color: C.grey, alpha: ba });
        L.rect(OX, PY - 100, 690, 200, { fill: 'rgba(131,193,103,0.08)', stroke: C.green, lw: 2.5, r: 26, alpha: ba, glow: L.rgba(C.green, 0.3) });
        L.text('네! 핵심만 3줄로 정리해 드릴게요.', OX + 36, PY - 38, { size: 34, weight: 600, color: C.white, alpha: ba });
        L.text('① 목표   ② 성과   ③ 다음 할 일', OX + 36, PY + 30, { size: 32, color: C.dim, alpha: ba });
        check(OX + 690 - 10, PY - 100, 24, L.ease(L.sub(p3, 0.62, 0.75)));
      }

      L.caption('글은 {y|잘 이어 쓰지만}, 질문에 답하는 비서는 아니다', L.vis(S, 1, 2, 0.88, 1, 0, 0.15));
      L.caption('사람이 {g|더 나은 답}을 골라 주면 → 그 방향으로 다시 조정 ({b|RLHF})', L.vis(S, 2, 3, 0.5, 0.65, 0, 0.15));
      L.caption('{y|글 잘 잇기} + {g|사람 피드백} = 좋은 AI 비서', L.vis(S, 3, undefined, 0.6, 0.8));
    },
  });
})();
