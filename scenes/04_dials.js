/* 4. AI 안에는 수천억 개의 다이얼이 있다 */
(() => {
  const L = MG.lib, C = L.C;
  const COLS = 7, ROWS = 4, D = 160, GX0 = 190, GY0 = 290, DR = 50;
  const FX = GX0 + (D * (COLS - 1)) / 2, FY = GY0 + (D * (ROWS - 1)) / 2; // 격자 중심 (670, 530)
  const vals0 = [...Array(COLS * ROWS)].map((_, i) => +((L.rnd(i * 5.3 + 1) - 0.5) * 3.4).toFixed(2));
  const TURN = { 2: 1.5, 8: -1.8, 12: 1.3, 17: -1.2, 23: 1.6 };
  const angOf = (v) => v * 0.9;
  const BARS0 = [0.52, 0.28, 0.15], BARS1 = [0.19, 0.64, 0.12];
  const BW = ['먹었다', '먹을까', '주문했다'], BC = [C.yellow, C.teal, C.blue];
  // 3D 블록 (왼쪽 면이 7×4 다이얼 격자)
  const MB = { n: 8, L: 3.2, h: 2.0, d: 3.4, rows: ROWS, cols: COLS, spread: 2.1, thick: 0.14 };
  const pose = (p1, p2) => {
    const r = L.ease(L.sub(p1, 0.08, 0.62)), z = L.easeInOut(p2);
    return {
      yaw: L.lerp(L.lerp(0, 0.62, r), 1.5, z),
      pitch: L.lerp(L.lerp(0, 0.3, r), 0.02, z),
      s: L.lerp(118, 262, z),
      explode: L.ease(L.sub(p1, 0.35, 0.95)),
    };
  };
  const valAt = (i, p3) => vals0[i] + (TURN[i] || 0) * L.ease(L.sub(p3, 0.15, 0.62));

  // 줌아웃용 오프스크린 타일 (레벨 k: 10^k × 10^k 개 다이얼이 600px 안에)
  let tiles = null;
  function makeTiles() {
    const mk = (fn) => { const c = document.createElement('canvas'); c.width = c.height = 600; fn(c.getContext('2d')); return c; };
    const t1 = mk((x) => {
      x.lineCap = 'round';
      for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
        const cx = 30 + 60 * i, cy = 30 + 60 * j, a = (L.rnd(i * 13.1 + j * 7.7) - 0.5) * 5;
        x.beginPath(); x.arc(cx, cy, 19, 0, Math.PI * 2); x.fillStyle = '#151515'; x.fill();
        x.lineWidth = 2; x.strokeStyle = '#9A9A9A'; x.stroke();
        x.lineWidth = 2.4; x.strokeStyle = '#C8C8C8'; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.sin(a) * 14, cy - Math.cos(a) * 14); x.stroke();
      }
    });
    const up = (src) => mk((x) => { for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) x.drawImage(src, 60 * i, 60 * j, 60, 60); });
    const t2 = up(t1), t3 = up(t2), t4 = up(t3);
    return [null, t1, t2, t3, t4];
  }

  MG.scene({
    id: 'dials', title: ['4', '수천억 개의 다이얼'],
    steps: [
      { d: 3.6, n: '블록을 열어 보면' },
      { d: 3.2, n: '레이어 한 장 속으로' },
      { d: 3.8, n: '다이얼을 돌리면 예측이 바뀐다' },
      { d: 5.6, n: '수천억 개 → Large' },
    ],
    draw(S, T) {
      const ctx = L.ctx;
      const p1 = L.st(S, 1), p2 = L.st(S, 2), p3 = L.st(S, 3), p4 = L.st(S, 4);

      // ---- 3D 블록 (1~2번 스텝) ----
      const a3 = L.ease(L.sub(p1, 0, 0.2)) * (1 - L.ease(L.sub(p2, 0.55, 0.8)));
      if (a3 > 0.003) {
        const ps = pose(p1, p2);
        const z = L.easeInOut(p2);
        const n0 = MB.n, spread = MB.L * L.lerp(1, MB.spread, L.ease(ps.explode));
        const fx = -spread / 2 + (0.5 * spread) / n0 - MB.thick / 2;
        const probe = L.cam({ ...ps, x: 0, y: 0 });
        const [px, py] = probe.p(fx, 0, 0);
        const baseX = 960, baseY = 540;
        const sx = L.lerp(baseX + px, FX, z), sy = L.lerp(baseY + py, FY, z);
        L.model({
          ...MB, ...ps, x: sx - px, y: sy - py, alpha: a3, label: 'LLM',
          dialAng: (i, r, c) => (i === 0 ? angOf(vals0[r * COLS + c]) : (L.rnd(i * 97 + r * 13 + c) - 0.5) * 5) + 0.12 * Math.sin(T * 1.3 + i + r * 2 + c * 3) * (1 - z),
        });
      }

      // ---- 2D 다이얼 격자 (2~3번 스텝) ----
      const g2 = L.ease(L.sub(p2, 0.5, 0.85));
      const sc0 = L.lerp(0.9, 1, L.ease(L.sub(p2, 0.5, 1)));
      const labA = g2 * (1 - L.ease(L.sub(p4, 0, 0.15)));
      if (p4 <= 0 && g2 > 0) {
        ctx.save(); ctx.translate(FX, FY); ctx.scale(sc0, sc0); ctx.translate(-FX, -FY);
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
          const i = r * COLS + c, x = GX0 + c * D, y = GY0 + r * D;
          const v = valAt(i, p3), turned = TURN[i] !== undefined;
          const hl = turned ? L.ease(L.sub(p3, 0.05, 0.2)) : 0;
          L.dial(x, y, DR, angOf(v), { color: L.mix('#A8A8A8', C.yellow, hl), needle: hl > 0.2 ? C.yellow : '#E0E0E0', ticks: true, alpha: g2, lw: 2.2, glow: null });
          L.text(L.fmtNum(v), x, y + DR + 26, { size: 24, font: 'serif', color: hl > 0.2 ? C.yellow : C.grey, align: 'center', alpha: labA });
        }
        ctx.restore();
      }
      L.text('파라미터', GX0 - 40, 180, { size: 40, weight: 700, color: C.white, alpha: labA });
      L.text('(가중치 · parameter · weight)', GX0 - 40 + L.tw('파라미터', { size: 40, weight: 700 }) + 16, 184, { size: 28, font: 'serifI', color: C.grey, alpha: labA });

      // ---- 예측 패널 (3번 스텝) ----
      const pa = L.ease(L.sub(p3, 0, 0.18)) * (1 - L.ease(L.sub(p4, 0, 0.15)));
      if (pa > 0) {
        const k = L.ease(L.sub(p3, 0.22, 0.7));
        L.arrow(1195, FY, 1285, FY, 1, { color: C.grey, alpha: pa });
        L.text('오늘 점심은 김치찌개를 ___', 1320, 360, { size: 32, color: C.dim, alpha: pa });
        const items = BW.map((w, i) => ({ w, v: L.lerp(BARS0[i], BARS1[i], k), c: BC[i], hl: (k < 0.5 ? i === 0 : i === 1) }));
        L.bars(1480, 460, items, 1, { gap: 78, maxW: 250, size: 34, vmax: 0.7, alpha: pa });
      }

      // ---- 줌아웃: 끝없는 다이얼 (4번 스텝) ----
      if (p4 > 0) {
        if (!tiles) tiles = makeTiles();
        const z = L.easeInOut(L.sub(p4, 0.08, 0.92));
        const sp = D * Math.pow(10, -3.4 * z); // 160px → 약 0.06px
        const k = sp / D;
        const ox = FX + (GX0 - FX) * k, oy = FY + (GY0 - FY) * k;
        const fieldA = L.ease(L.sub(p4, 0, 0.15));
        if (sp >= 36) {
          const i0 = Math.ceil((-sp - ox) / sp), i1 = Math.floor((1920 + sp - ox) / sp);
          const j0 = Math.ceil((-sp - oy) / sp), j1 = Math.floor((1080 + sp - oy) / sp);
          for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
            const inGrid = i >= 0 && i < COLS && j >= 0 && j < ROWS;
            const idx = j * COLS + i;
            const ang = inGrid ? angOf(valAt(idx, 1)) : (L.rnd(i * 13.1 + j * 7.7) - 0.5) * 5;
            const hl = inGrid && TURN[idx] !== undefined ? 1 - L.sub(p4, 0, 0.2) : 0;
            L.dial(ox + i * sp, oy + j * sp, sp * DR / D, ang, { color: L.mix('#A0A0A0', C.yellow, hl), needle: hl > 0.3 ? C.yellow : '#D0D0D0', ticks: sp > 90, alpha: inGrid ? 1 : fieldA, lw: Math.max(1, sp * 0.014) });
            if (inGrid && labA > 0) L.text(L.fmtNum(valAt(idx, 1)), ox + i * sp, oy + j * sp + sp * (DR + 26) / D, { size: 24 * k, font: 'serif', color: hl > 0.2 ? C.yellow : C.grey, align: 'center', alpha: labA });
          }
        } else {
          let lv = 1; while (lv < 4 && Math.pow(10, lv) * sp < 48) lv++;
          const ts = Math.pow(10, lv) * sp, n = Math.pow(10, lv);
          const a0 = Math.floor((-ox + 0.5 * sp) / ts) - 1, a1 = Math.ceil((1920 - ox) / ts) + 1;
          const b0 = Math.floor((-oy + 0.5 * sp) / ts) - 1, b1 = Math.ceil((1080 - oy) / ts) + 1;
          ctx.save(); ctx.globalAlpha *= fieldA; ctx.imageSmoothingQuality = 'high';
          for (let a = a0; a <= a1; a++) for (let b = b0; b <= b1; b++) {
            ctx.drawImage(tiles[lv], ox + a * n * sp - 0.5 * sp, oy + b * n * sp - 0.5 * sp, ts, ts);
          }
          ctx.restore();
        }
        // 가장자리 비네트
        const vg = ctx.createRadialGradient(960, 540, 300, 960, 540, 1150);
        vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.7)');
        ctx.fillStyle = vg; ctx.fillRect(0, 0, 1920, 1080);

        // 개수 카운터
        const ca = L.ease(L.sub(p4, 0.18, 0.32));
        if (ca > 0) {
          L.rect(960 - 520, 540 - 150, 1040, 300, { fill: 'rgba(0,0,0,0.86)', stroke: L.rgba('#FFFFFF', 0.25), lw: 1.5, r: 22, alpha: ca });
          L.text('GPT-3 한 모델에 들어 있는 다이얼', 960, 455, { size: 34, weight: 600, color: C.dim, align: 'center', alpha: ca });
          const e = L.easeInOut(L.sub(p4, 0.2, 0.9));
          const cnt = e >= 1 ? 175e9 : Math.round(Math.pow(10, L.lerp(1, Math.log10(175e9), e)));
          const done = L.ease(L.sub(p4, 0.9, 1));
          L.text(cnt.toLocaleString('en-US'), 960, 548, { size: 104, font: 'serif', color: L.mix(C.white, C.yellow, done), align: 'center', alpha: ca, glow: done > 0 ? L.rgba(C.yellow, 0.5 * done) : null, blur: 36 });
          L.fadeText('= 1,750억 개', 960, 632, L.sub(p4, 0.88, 1), { size: 36, weight: 700, color: C.yellow, align: 'center', alpha: ca });
        }
      }

      L.caption('모델 안에는 수많은 {y|다이얼}이 있다', L.vis(S, 1, 2, 0.45, 0.8, 0, 0.18));
      L.caption('다이얼 하나 = 숫자 하나 = {y|파라미터(가중치)}', L.vis(S, 2, 3, 0.55, 0.85, 0, 0.18));
      L.caption('다이얼 값이 바뀌면 → {y|예측이 바뀐다}', L.vis(S, 3, 4, 0.2, 0.45, 0, 0.18));
      L.caption('이런 다이얼이 수백억~수천억 개 → 그래서 {y|대규모(Large)} 언어 모델', L.vis(S, 4, undefined, 0.85, 1));
    },
  });
})();
