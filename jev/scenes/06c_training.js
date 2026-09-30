/* (공학) 어떻게 훈련했나 — RLHF / RLVR / RLCD */
(() => {
  const L = MG.lib, C = L.C, J = window.JV;
  const ROWS = [
    { m: 'RLHF', full: '사람의 피드백', to: '챗봇', d: '사람이 좋아하는 답을 쓰도록', c: C.purple },
    { m: 'RLVR', full: '검증 가능한 보상', to: '추론 모델', d: '수학에 강하지만 느리고 비쌈', c: C.blue },
    { m: 'RLCD', full: '보정된 결정', to: 'Jev', d: '글 대신 결정 + 보정된 확률', c: C.yellow },
  ];
  const RY = [280, 430, 580];
  const PROBS = [
    { h: '비위 맞추기', s: '듣기 좋은 말을 우선' },
    { h: '그럴듯하게 틀리기', s: '자신 있는 말투의 환각' },
    { h: '다양성 감소', s: '한 가지 스타일로 쏠림' },
  ];

  MG.scene({
    id: 'training', only: 'full', title: ['10', '어떻게 훈련했나'],
    steps: [
      { d: 5.4, n: 'RLHF → 챗봇, RLVR → 추론 모델, RLCD → Jev' },
      { d: 4.8, n: 'RLHF의 부작용' },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2);
      L.fadeText('미리 학습된 언어 모델', 240, 430, L.sub(p1, 0, 0.2), { size: 28, weight: 700, color: C.white, align: 'center' });
      L.fadeText('(Pretrained)', 240, 470, L.sub(p1, 0.05, 0.25), { size: 24, font: 'serifI', color: C.grey, align: 'center' });
      ROWS.forEach((R, i) => {
        const q = L.sub(p1, 0.15 + i * 0.22, 0.45 + i * 0.22);
        const hl = i === 2 ? 1 : 0;
        const dim = i === 0 ? 1 : L.lerp(1, 0.45, L.ease(L.sub(p2, 0, 0.2)));
        const a = L.ease(q) * dim;
        if (a <= 0.003) return;
        const y = RY[i];
        const f = L.cbez(400, 450, 470, 450, 480, y, 560, y);
        L.pathLine(f, 0, L.ease(L.sub(q, 0, 0.4)), { color: L.rgba(R.c, 0.8), lw: 3, head: 14, alpha: dim });
        L.rect(580, y - 50, 300, 100, { fill: L.rgba(R.c, 0.1), stroke: R.c, lw: hl ? 3 : 2, r: 14, alpha: a, glow: hl ? L.rgba(R.c, 0.4) : null });
        L.text(R.m, 730, y - 14, { size: 38, font: 'serif', color: R.c, align: 'center', alpha: a });
        L.text(R.full, 730, y + 26, { size: 22, color: C.dim, align: 'center', alpha: a });
        L.arrow(900, y, 990, y, L.ease(L.sub(q, 0.4, 0.7)), { color: R.c, lw: 3, alpha: dim });
        const ra = a * L.ease(L.sub(q, 0.55, 1));
        L.text(R.to, 1015, y - 14, { size: 36, weight: 700, font: i === 2 ? 'serif' : undefined, color: C.white, alpha: ra });
        L.text(R.d, 1015, y + 26, { size: 26, color: R.c, alpha: ra });
      });
      const na = L.ease(L.sub(p1, 0.85, 1)) * (1 - L.ease(L.sub(p2, 0, 0.2)));
      L.text('RLHF 공동 발명자 디오고 알메이다 = TypeSafe 공동 창업자', 960, 720, { size: 24, color: C.grey, align: 'center', alpha: na });

      // ---- 2: RLHF의 부작용 ----
      L.fadeText('RLHF의 부작용', 960, 665, L.sub(p2, 0.1, 0.3), { size: 28, weight: 700, color: C.purple, align: 'center' });
      PROBS.forEach((P, i) => {
        const q = L.sub(p2, 0.2 + i * 0.15, 0.5 + i * 0.15);
        const a = L.ease(q);
        if (a <= 0.003) return;
        const x = 330 + i * 440;
        L.rect(x, 705, 380, 130, { fill: 'rgba(252,98,85,0.08)', stroke: C.red, lw: 2, r: 14, alpha: a });
        L.text(P.h, x + 190, 745, { size: 32, weight: 700, color: C.red, align: 'center', alpha: a });
        L.text(P.s, x + 190, 792, { size: 24, color: C.dim, align: 'center', alpha: a });
      });

      L.caption('훈련 {y|목표}가 다르면 모델도 달라져요', J.cap(S, 1, 2));
      L.caption('“사람이 좋아하는 답” ≠ “{y|믿을 수 있는 답}”', J.cap(S, 2));
    },
  });
})();
