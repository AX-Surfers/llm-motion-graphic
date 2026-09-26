/* 5. 훈련 = 다이얼을 자동으로 맞춰가는 과정 */
(() => {
  const L = MG.lib, C = L.C;
  const FS = 42, SX = 110, SY = 530;
  const SENT = '비가 와서 우산을';
  const M = { x: 880, y: SY, s: 66, yaw: 0.6, pitch: 0.3, explode: 1, n: 6, spread: 1.9, rows: 3, cols: 3 };
  const BX = 1420, BY = 380, GAP = 74, MAXW = 270;
  const WORDS = ['챙겼다', '샀다', '먹었다', '잃어버렸다', '기타'];
  const P0 = [0.04, 0.18, 0.31, 0.24, 0.23];
  const P1 = [0.11, 0.2, 0.26, 0.21, 0.22];
  const P2 = [0.86, 0.05, 0.01, 0.03, 0.05];
  const COL = [C.green, C.blue, C.blue, C.blue, C.grey];
  const NC = 14; // 4번 스텝의 빠른 반복 횟수
  const cycW = [...Array(NC)].map((_, k) => Math.pow(0.82, k));
  const cycT = cycW.reduce((a, b) => a + b, 0);
  const cycB = [0]; cycW.forEach((w) => cycB.push(cycB[cycB.length - 1] + w / cycT));
  const UNITS = [
    [1, '1초'], [60, '1분'], [3600, '1시간'], [86400, '1일'], [2629800, '1개월'], [31557600, '1년'], [315576000, '10년'],
    [3155760000, '100년'], [31557600000, '1,000년'], [315576000000, '1만 년'], [3.15576e12, '10만 년'], [3.15576e13, '100만 년'],
    [3.15576e14, '1,000만 년'], [3.15576e15, '1억 년'],
  ];
  const ZX0 = 260, ZX1 = 1660, ZY = 690;
  const bump = (x) => Math.exp(-x * x * 1.3);

  function chip(x, y, s, lit, a) {
    if (a <= 0.003) return;
    const col = L.mix('#7A7A7A', C.teal, lit);
    for (let k = 0; k < 4; k++) {
      const o = -s * 0.3 + (k * s * 0.6) / 3;
      L.line(x + o, y - s * 0.62, x + o, y - s * 0.5, { color: col, lw: 2, alpha: a });
      L.line(x + o, y + s * 0.5, x + o, y + s * 0.62, { color: col, lw: 2, alpha: a });
      L.line(x - s * 0.62, y + o, x - s * 0.5, y + o, { color: col, lw: 2, alpha: a });
      L.line(x + s * 0.5, y + o, x + s * 0.62, y + o, { color: col, lw: 2, alpha: a });
    }
    L.rect(x - s / 2, y - s / 2, s, s, { fill: '#141414', stroke: col, lw: 2, r: 6, alpha: a, glow: lit > 0.5 ? L.rgba(C.teal, 0.5 * lit) : null, blur: 18 });
    L.rect(x - s * 0.22, y - s * 0.22, s * 0.44, s * 0.44, { fill: L.rgba(C.teal, 0.15 + 0.7 * lit), r: 3, alpha: a });
  }

  MG.scene({
    id: 'training', title: ['5', '훈련 = 다이얼 맞추기'],
    steps: [
      { d: 2.8, n: '① 마지막 단어 가리기' },
      { d: 3.6, n: '② 예측 → ③ 정답과 비교' },
      { d: 3.6, n: '④ 다이얼을 조금 조정 (역전파)' },
      { d: 5.4, n: '셀 수 없이 반복' },
      { d: 5.6, n: '계산량: 1억 년' },
      { d: 3.8, n: 'GPU 수만 개로 몇 달' },
    ],
    draw(S, T) {
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = L.st(S, 3), p4 = L.st(S, 4), p5 = L.st(S, 5), p6 = L.st(S, 6);
      const A1 = 1 - L.ease(L.sub(p5, 0, 0.2)); // 1~4번 스텝 요소
      const sw = L.tw(SENT, { size: FS }), mx = SX + sw + 14, mw = 150, mh = 64;

      if (A1 > 0.003) {
        // ---- 문장 + 가린 단어 ----
        L.writeText(SENT, SX, SY, L.sub(p1, 0, 0.5), { size: FS, alpha: A1 });
        const ma = L.ease(L.sub(p1, 0.35, 0.6)) * A1;
        const rev = L.ease(L.sub(p2, 0.86, 1));
        L.rect(mx, SY - mh / 2, mw, mh, { fill: '#262626', stroke: L.mix('#6A6A6A', C.green, rev), lw: 2.5, r: 10, alpha: ma });
        L.text('?', mx + mw / 2, SY + 2, { size: 40, font: 'serif', color: C.grey, align: 'center', alpha: ma * (1 - rev) });
        L.text('챙겼다', mx + mw / 2, SY + 1, { size: FS, weight: 700, color: C.green, align: 'center', alpha: ma * rev });
        L.fadeText('정답', mx + mw / 2, SY + 70, rev, { size: 26, color: C.green, align: 'center', alpha: A1 });

        // ---- 다이얼 각도 (조정되며 바뀐다) ----
        const adj1 = L.ease(L.sub(p3, 0.2, 0.7));
        const adj2 = L.easeInOut(L.sub(p4, 0.05, 0.95));
        const dialAng = (i, r, c) => {
          const k = i * 97 + r * 13 + c;
          return (L.rnd(k) - 0.5) * 5 + (L.rnd(k + 5) - 0.5) * 1.2 * adj1 + (L.rnd(k + 9) - 0.5) * 3.5 * adj2
            + (adj2 > 0 && adj2 < 1 ? 0.25 * Math.sin(T * 9 + k) : 0);
        };
        // ---- 앞으로/뒤로 흐르는 파동 ----
        let fw = -9, bw = -9;
        if (p2 > 0 && p2 < 1) fw = L.lerp(-1.2, M.n + 0.2, L.sub(p2, 0.15, 0.45));
        if (p3 > 0 && p3 < 1) bw = L.lerp(M.n + 0.2, -1.2, L.sub(p3, 0.12, 0.55));
        let fast = null;
        if (p4 > 0 && p4 < 1) {
          const t = L.sub(p4, 0.02, 0.98);
          let k = 0; while (k < NC - 1 && t > cycB[k + 1]) k++;
          const q = L.sub(t, cycB[k], cycB[k + 1]);
          fast = q;
          if (q < 0.5) fw = L.lerp(-1.2, M.n + 0.2, q * 2); else bw = L.lerp(M.n + 0.2, -1.2, (q - 0.5) * 2);
        }
        const hlF = (i) => bump(i - fw), hlB = (i) => bump(i - bw);
        const m = L.model({
          ...M, alpha: A1 * L.ease(L.sub(p1, 0.2, 0.6)), dialAng,
          hl: (i) => Math.max(hlF(i), hlB(i)), hlColor: bw > -5 && hlB(Math.round(bw)) > 0.1 ? C.gold : C.blue,
        });
        const ax0 = mx + mw + 20, ax1 = m.left[0] - 12, ox0 = m.right[0] + 12, ox1 = BX - 205;
        L.arrow(ax0, SY, ax1, SY, L.ease(L.sub(p1, 0.5, 0.85)), { color: C.grey, alpha: A1 });
        L.arrow(ox0, SY, ox1, SY, L.ease(L.sub(p1, 0.6, 0.95)), { color: C.grey, alpha: A1 });
        L.comet((t) => [L.lerp(ax0, ax1, t), SY], L.sub(p2, 0, 0.17), { color: C.blue, r: 18, alpha: A1 });
        L.comet((t) => [L.lerp(ox0, ox1, t), SY], L.sub(p2, 0.43, 0.55), { color: C.blue, r: 18, alpha: A1 });
        // 오차 신호: 정답 행 → 모델 (뒤로)
        const eF = L.cbez(BX - 160, BY, BX - 260, BY - 10, ox0 + 80, SY - 150, ox0, SY - 20);
        L.comet(eF, L.sub(p3, 0, 0.18), { color: C.gold, r: 20, alpha: A1 });
        L.text('오차', BX - 240, BY - 60, { size: 28, weight: 700, color: C.gold, align: 'center', alpha: A1 * Math.sin(Math.PI * L.sub(p3, 0, 0.45)) });

        // ---- 확률 막대 ----
        const k1 = L.ease(L.sub(p3, 0.5, 0.95)), k2 = L.easeInOut(L.sub(p4, 0.05, 0.95));
        const vals = WORDS.map((_, i) => L.lerp(L.lerp(P0[i], P1[i], k1), P2[i], k2));
        const items = WORDS.map((w, i) => ({ w, v: vals[i], c: COL[i], hl: i === 0 && (p2 >= 0.86) }));
        L.bars(BX, BY, items, L.sub(p2, 0.5, 0.88), { gap: GAP, maxW: MAXW, size: 36, vmax: 1, alpha: A1, stag: 0.06 });
        // 오답 표시
        const xa = A1 * L.ease(L.sub(p2, 0.78, 0.88)) * (1 - L.ease(L.sub(p3, 0.4, 0.6)));
        if (xa > 0) {
          const yy = BY + 2 * GAP;
          L.rect(BX - 195, yy - 32, 610, 64, { stroke: C.red, lw: 2.5, r: 10, alpha: xa });
          L.line(BX + 372, yy - 13, BX + 398, yy + 13, { color: C.red, lw: 5, alpha: xa }); L.line(BX + 398, yy - 13, BX + 372, yy + 13, { color: C.red, lw: 5, alpha: xa });
          L.text('AI의 1등 예측', BX + 355, yy + 1, { size: 22, weight: 600, color: C.red, align: 'right', alpha: xa });
        }
        const ca = A1 * L.ease(L.sub(p2, 0.88, 1));
        if (ca > 0) L.rect(BX - 195, BY - 32, 610, 64, { stroke: C.green, lw: 2.5, r: 10, alpha: ca, glow: k2 > 0.9 ? L.rgba(C.green, 0.5) : null });

        // ---- 반복 카운터 + 오차 그래프 (4번 스텝) ----
        const ra = A1 * L.ease(L.sub(p4, 0, 0.12));
        if (ra > 0) {
          const e = L.easeIn(L.sub(p4, 0.02, 0.97));
          const n = Math.round(Math.pow(10, L.lerp(0, Math.log10(3e11), e)));
          L.text('다음 단어 맞히기 연습', 1840, 172, { size: 26, color: C.grey, align: 'right', alpha: ra });
          L.text(n.toLocaleString('en-US') + '번', 1840, 222, { size: 50, font: 'serif', color: e >= 1 ? C.yellow : C.white, align: 'right', alpha: ra });
          L.fadeText('(GPT-3 기준 약 3,000억 번)', 1840, 268, L.sub(p4, 0.93, 1), { size: 22, color: C.grey, align: 'right', alpha: A1 });
          // 오차 곡선
          const gx = 120, gy = 700, gw = 430, gh = 190;
          L.line(gx, gy, gx, gy + gh, { color: C.grey2, lw: 2, alpha: ra });
          L.line(gx, gy + gh, gx + gw, gy + gh, { color: C.grey2, lw: 2, alpha: ra });
          L.text('오차', gx + 12, gy + 4, { size: 24, color: C.gold, alpha: ra });
          L.text('반복 →', gx + gw, gy + gh + 30, { size: 22, color: C.grey, align: 'right', alpha: ra });
          const lossF = (t) => {
            const v = 0.12 + 0.82 * Math.exp(-t * 4.2) + 0.05 * Math.sin(t * 57) * (1 - t) + 0.025 * Math.sin(t * 131);
            return [gx + 8 + t * (gw - 16), gy + gh - v * gh];
          };
          L.pathLine(lossF, 0, Math.max(0.001, L.sub(p4, 0.03, 0.97)), { color: C.gold, lw: 3, n: 120, alpha: ra });
        }
        void fast;
      }

      // ---- 5. 계산량 줌아웃: 1초 → 1억 년 ----
      const za = L.ease(L.sub(p5, 0.12, 0.3)) * (1 - L.ease(L.sub(p6, 0, 0.25)));
      const zt = L.sub(p5, 0.24, 0.93), zl = 0.35 * L.ease(zt) + 0.65 * zt;
      const logSpan = L.lerp(Math.log(1.25), Math.log(3.15576e15 * 1.25), zl);
      const span = Math.exp(logSpan);
      let cur = 0; while (cur < UNITS.length - 1 && UNITS[cur + 1][0] <= span / 1.2) cur++;
      if (za > 0) {
        L.writeText('1초에 10억 번 계산하는 컴퓨터로 이 훈련을 하면…', 960, 230, L.sub(p5, 0.12, 0.4), { size: 46, weight: 700, align: 'center', color: C.white, alpha: za });
        const W = ZX1 - ZX0;
        L.line(ZX0, ZY, ZX1, ZY, { color: C.grey, lw: 3, alpha: za });
        UNITS.forEach(([u, lab], idx) => {
          const px = (u / span) * W;
          if (px < 4 || u > span * 1.01) return;
          const cnt = Math.floor(span / u + 1e-9);
          if (cnt > 400) return;
          const a = za * L.sub(px, 4, 30);
          const h = 8 + 26 * L.sub(px, 20, 500);
          for (let k = 0; k <= cnt; k++) {
            const x = ZX0 + k * px; if (x > ZX1 + 1) break;
            L.line(x, ZY - h / 2, x, ZY + h / 2, { color: C.dim, lw: 1.5 + 1.5 * L.sub(px, 60, 600), alpha: a });
          }
          // 단위 괄호
          const ba = za * L.ease(L.sub(px, 50, 160)) * (1 - L.ease(L.sub(px, W * 0.82, W * 1.02)));
          if (ba > 0.01) {
            const yb = ZY + 50 + (idx % 2) * 58;
            L.line(ZX0, yb, ZX0 + px, yb, { color: C.yellow, lw: 3, alpha: ba });
            L.line(ZX0, yb - 10, ZX0, yb + 10, { color: C.yellow, lw: 3, alpha: ba });
            L.line(ZX0 + px, yb - 10, ZX0 + px, yb + 10, { color: C.yellow, lw: 3, alpha: ba });
            L.text(lab, ZX0 + px / 2, yb + 30, { size: 26, weight: 600, color: C.yellow, align: 'center', alpha: ba });
          }
        });
        // 큰 표시
        const next = UNITS[Math.min(UNITS.length - 1, cur + 1)][0];
        const fr = L.clamp((logSpan - Math.log(UNITS[cur][0] * 1.2)) / Math.max(0.001, Math.log(next / UNITS[cur][0])));
        const pop = 1 + 0.12 * (1 - L.sub(fr, 0, 0.3));
        const fin = cur === UNITS.length - 1 ? L.ease(L.sub(p5, 0.9, 1)) : 0;
        const lab = UNITS[cur][1];
        if (!(p6 > 0)) L.text(lab, 960, 470, { size: 150, weight: 800, color: L.mix(C.white, C.yellow, fin), align: 'center', scale: pop, alpha: za * L.ease(L.sub(p5, 0.22, 0.3)), glow: fin > 0 ? L.rgba(C.yellow, 0.5 * fin) : null, blur: 40 });
      }

      // ---- 6. GPU 병렬 ----
      if (p6 > 0) {
        const up = L.ease(L.sub(p6, 0, 0.3));
        const ty = L.lerp(470, 250, up), ts = L.lerp(1, 0.62, up);
        const tw = L.tw('1억 년', { size: 150, weight: 800 }) * ts;
        const tx = L.lerp(960, 960 - 170, up);
        L.text('1억 년', tx, ty, { size: 150, weight: 800, color: C.yellow, align: 'center', scale: ts });
        const sk = L.ease(L.sub(p6, 0.62, 0.78));
        if (sk > 0) L.line(tx - tw / 2 - 10, ty, tx - tw / 2 - 10 + (tw + 20) * sk, ty, { color: C.red, lw: 7 });
        L.fadeText('→  몇 달', tx + tw / 2 + 44, ty, L.sub(p6, 0.72, 0.9), { size: 84, weight: 800, color: C.teal, align: 'left' });
        const cols = 16, rows = 4, cs = 58, gp = 30;
        const gx0 = 960 - ((cols - 1) * (cs + gp)) / 2, gy0 = 520;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const a = L.ease(L.sub(p6, 0.12 + (i / (rows * cols)) * 0.2, 0.3 + (i / (rows * cols)) * 0.2));
          const lit = L.ease(L.sub(p6, 0.42, 0.55)) * (0.75 + 0.25 * Math.sin(T * 6 + L.rnd(i) * 6));
          chip(gx0 + c * (cs + gp), gy0 + r * (cs + gp), cs, lit, a);
        }
        L.fadeText('GPU (병렬 계산 칩) × 수만 개', 960, gy0 + rows * (cs + gp) + 16, L.sub(p6, 0.3, 0.5), { size: 30, weight: 600, color: C.dim, align: 'center' });
      }

      L.caption('① 문장의 마지막 단어를 {y|가리고}', L.vis(S, 1, 2, 0.5, 0.85, 0, 0.15));
      L.caption('② 다음 단어를 예측하고 → ③ {g|정답}과 비교', L.vis(S, 2, 3, 0.2, 0.4, 0, 0.15));
      L.caption('④ 정답에 가까워지도록 다이얼을 {y|아주 조금} 조정 — 역전파', L.vis(S, 3, 4, 0.2, 0.4, 0, 0.15));
      L.caption('이걸 {y|셀 수 없이} 반복하면 → 처음 보는 문장도 그럴듯하게 예측', L.vis(S, 4, 5, 0.15, 0.35, 0, 0.15));
      L.caption('그래도 {y|1억 년} 넘게 걸리는 계산량', L.vis(S, 5, 6, 0.9, 1, 0, 0.15));
      L.caption('실제로는 {b|GPU} 수만 개를 동시에 돌려 {t|몇 달} 만에 끝낸다', L.vis(S, 6, undefined, 0.3, 0.5));
    },
  });
})();
