/* 8. 어디에 쓸 수 있을까 — docs.typesafe.ai/concepts/use-case-map */
(() => {
  const L = MG.lib, C = L.C, J = window.JV;
  const CW = 540, CH = 200, GX = [90, 690, 1290], GY = [175, 400];
  const CASES = [
    { d: '고객 상담', q: '환불을 요청하나?', t: 'Noul', v: '0.97', c: C.pink },
    { d: '채용', q: '필요한 경력이 얼마나 되나?', t: 'Score', v: '2.6 / 3', c: C.teal },
    { d: '보험 청구', q: '사기 의심 신호가 있나?', t: 'Noul', v: '0.12', c: C.pink },
    { d: '쇼핑몰 상품 등록', q: '어느 카테고리 상품인가?', t: 'Choice', v: '운동화', c: C.yellow },
    { d: '커뮤니티 관리', q: '욕설이나 괴롭힘인가?', t: 'Noul', v: '0.91', c: C.pink },
    { d: '다른 AI 검사', q: '근거 없이 지어낸 답인가?', t: 'Noul', v: '0.83', c: C.pink },
  ];
  const FEATS = [
    { h: '엄청 많이', b: '약 100배 저렴 → 수백만 건도 처리', c: C.blue },
    { h: '실시간으로', b: '약 0.15초 → 사람이 알아채기 전에', c: C.green },
    { h: 'AI를 감시', b: '다른 AI의 실수·탈옥을 싸게 검사', c: C.purple },
  ];

  MG.scene({
    id: 'usecases', title: ['12', '어디에 쓸 수 있을까'], titleBasic: ['8', '어디에 쓸 수 있을까'],
    steps: [
      { d: 5.0, n: '분야별 예시 6가지' },
      { d: 4.4, n: '많이 · 빠르게 · AI 검사' },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2);
      const dim = L.lerp(1, 0.4, L.ease(L.sub(p2, 0, 0.25)));
      CASES.forEach((K, i) => {
        const x = GX[i % 3], y = GY[Math.floor(i / 3)];
        const q = L.sub(p1, i * 0.1, 0.35 + i * 0.1);
        const a = L.ease(q) * dim;
        if (a <= 0.003) return;
        const dy = (1 - L.ease(q)) * 20;
        L.rect(x, y + dy, CW, CH, { fill: 'rgba(255,255,255,0.03)', stroke: C.grey2, lw: 2, r: 16, alpha: a });
        L.circle(x + 36, y + dy + 46, 8, { fill: K.c, alpha: a });
        L.text(K.d, x + 56, y + dy + 46, { size: 32, weight: 700, color: C.white, alpha: a });
        L.text('“' + K.q + '”', x + 30, y + dy + 105, { size: 28, color: C.dim, alpha: a });
        const va = a * L.ease(L.sub(q, 0.55, 1));
        const tw = L.tw(K.t, { size: 24, font: 'serifI' }) + 22;
        const vx = x + CW - 30;
        L.text(K.v, vx, y + dy + 160, { size: 34, weight: 700, font: /[0-9]/.test(K.v) ? 'serif' : undefined, color: K.c, align: 'right', alpha: va });
        const vw = L.tw(K.v, { size: 34, weight: 700, font: /[0-9]/.test(K.v) ? 'serif' : undefined });
        L.rect(vx - vw - 20 - tw, y + dy + 143, tw, 34, { fill: L.rgba(K.c, 0.18), r: 7, alpha: va });
        L.text(K.t, vx - vw - 20 - tw / 2, y + dy + 161, { size: 24, font: 'serifI', color: K.c, align: 'center', alpha: va });
      });
      FEATS.forEach((F, i) => {
        const q = L.sub(p2, 0.15 + i * 0.15, 0.5 + i * 0.15);
        const a = L.ease(q);
        if (a <= 0.003) return;
        const x = GX[i], y = 690 + (1 - a) * 20;
        L.rect(x, y, CW, 190, { fill: L.rgba(F.c, 0.08), stroke: F.c, lw: 2.5, r: 16, alpha: a, glow: L.rgba(F.c, 0.3) });
        L.text(F.h, x + CW / 2, y + 62, { size: 40, weight: 800, color: F.c, align: 'center', alpha: a });
        L.text(F.b, x + CW / 2, y + 130, { size: 27, color: C.text, align: 'center', alpha: a });
      });
      L.caption('말로 된 자료를 {y|판단}해야 하는 곳이면 어디든', J.cap(S, 1, 2));
      L.caption('특히 {y|많이 · 빠르게 · 싸게} 판단해야 할 때 빛나요', J.cap(S, 2));
    },
  });
})();
