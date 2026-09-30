/* (공학) 요청과 응답의 모양 — state(JSON) + questions(type·instructions·criteria) → answers */
(() => {
  const L = MG.lib, C = L.C, J = window.JV;
  const PW = 575, PX = [70, 673, 1276], PY = 160, PH = 770, FS = 22, LH = 31;
  const STATE = [
    '{d|"state": {}',
    '  {b|"ticket"}: {d|{}',
    '    {b|"message"}: "주문 A-104가',
    '       두 번 결제됐어요. 중복된 건',
    '       환불해 주세요."',
    '  },',
    '  {b|"order"}: {d|{}',
    '    {b|"id"}: "A-104",',
    '    {b|"charges"}: [',
    '      { {b|"amount_usd"}: {y|49}, "captured" },',
    '      { {b|"amount_usd"}: {y|49}, "captured" }',
    '    ]',
    '  },',
    '  {b|"refund_policy"}:',
    '    "중복 결제는 환불 대상"',
    '{d|}}',
  ];
  const QS = [
    '{d|"questions": {}',
    '  {p|"department"}: {',
    '    {b|"type"}: {y|"choice"},',
    '    {b|"instructions"}: "어느 팀이 맡을까?",',
    '    {b|"criteria"}: {',
    '      {g|"billing"}: "결제·청구 문제",',
    '      {g|"shipping"}: "배송·지연·분실",',
    '      {g|"returns"}: "교환·불량·반품"',
    '    }',
    '  },',
    '  {p|"refund"}: {',
    '    {b|"type"}: {y|"noul"},',
    '    {b|"instructions"}: "환불을 원하나?"',
    '  },',
    '  {p|"frustration"}: {',
    '    {b|"type"}: {y|"score"},',
    '    {b|"criteria"}: ["차분", "짜증",',
    '                   "매우 화남"]',
    '  }',
    '{d|}}',
  ];
  const ANS = [
    '{d|"answers": {}',
    '  {p|"department"}: {',
    '    {b|"choice"}: {g|"billing"},',
    '    {b|"probabilities"}: {',
    '      "billing": {y|0.91},',
    '      "shipping": {y|0.06},',
    '      "returns": {y|0.03}',
    '    },',
    '    {b|"confidence"}: {y|0.88}',
    '  },',
    '  {p|"refund"}: {',
    '    {b|"noul"}: {y|0.97}',
    '  },',
    '  {p|"frustration"}: {',
    '    {b|"score"}: {y|1.28},',
    '    {b|"probabilities"}: {',
    '      "0": {y|0.10}, "1": {y|0.52}, "2": {y|0.38}',
    '    }, {b|"confidence"}: {y|0.41}',
    '  }',
    '{d|}}',
  ];

  function panel(k, title, sub, col, lines, p, a) {
    if (a <= 0.003) return;
    const x = PX[k];
    L.rect(x, PY, PW, PH, { fill: 'rgba(14,14,14,0.96)', stroke: col, lw: 2, r: 16, alpha: a, draw: L.ease(L.sub(p, 0, 0.3)) });
    L.text(title, x + 26, PY + 40, { size: 30, weight: 700, color: col, alpha: a });
    L.text(sub, x + 26 + L.tw(title, { size: 30, weight: 700 }) + 14, PY + 42, { size: 22, color: C.grey, alpha: a });
    L.line(x + 20, PY + 72, x + PW - 20, PY + 72, { color: C.grey3, lw: 1.5, alpha: a });
    lines.forEach((s, i) => {
      const q = L.sub(p, 0.15 + (i / lines.length) * 0.7, 0.25 + (i / lines.length) * 0.7);
      L.rich(s, x + 26, PY + 108 + i * LH, { size: FS, color: C.text, hiWeight: 500, alpha: a * L.ease(q) });
    });
  }

  MG.scene({
    id: 'request', only: 'full', title: ['5', '요청과 응답의 모양'],
    steps: [
      { d: 4.6, n: 'state: 판단 재료를 JSON으로' },
      { d: 4.8, n: 'questions: 종류 + 지시문 + 선택지 설명' },
      { d: 5.0, n: 'answers: 정해진 모양으로만' },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = L.st(S, 3);
      panel(0, '상태', 'state', C.blue, STATE, p1, L.ease(L.sub(p1, 0, 0.2)));
      panel(1, '질문', 'questions', C.yellow, QS, p2, L.ease(L.sub(p2, 0, 0.2)));
      panel(2, '답', 'answers', C.green, ANS, p3, L.ease(L.sub(p3, 0, 0.2)));
      // 주석: 질문 이름(id)은 모델에게 안 보인다
      const na = L.ease(L.sub(p2, 0.8, 1)) * (1 - L.ease(L.sub(p3, 0, 0.2)) * 0.4);
      if (na > 0) {
        const nx = PX[1] + 250, ny = PY + 108 + LH;
        L.rect(PX[1] + 20, ny - 18, 210, 36, { stroke: C.purple, lw: 2, r: 8, alpha: na });
        L.text('← 이름표. 모델엔 안 보여요', nx, ny + 1, { size: 20, color: C.purple, alpha: na });
      }
      L.caption('상태 = 판단에 필요한 {b|자료 묶음} (대화 · 주문 · 정책)', J.cap(S, 1, 2));
      L.caption('질문 = {y|종류} + {y|지시문} + {y|선택지 설명}', J.cap(S, 2, 3));
      L.caption('답은 항상 {g|정해진 모양} 안에서만 — 선택지 밖의 값은 없어요', J.cap(S, 3));
    },
  });
})();
