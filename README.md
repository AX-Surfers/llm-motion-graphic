# AI 원리 모션그래픽 (SURFERS)

AI 개념을 3Blue1Brown 스타일의 스텝형 Canvas 애니메이션으로 설명합니다. → / ← 로 한 동작씩 넘기며 발표하고, 스텝별 MP4·자동 재생 PPTX로도 뽑을 수 있습니다.

배포: https://ai101.surfersclub.org (Vercel, `vercel deploy --prod`)

| 경로 | 내용 | 버전 |
|---|---|---|
| `/` | 이론 선택 홈 화면 (`index.html`) | |
| `/llm/` | LLM은 어떻게 말을 할까? ([llm/README.md](llm/README.md)) | 초보자 · 기본 |
| `/jev/` | Jev는 어떻게 판단할까? ([jev/README.md](jev/README.md)) | 쉬운 · 공학 |

- 예전 주소(루트의 `?v=basic`, `#12` 등)는 자동으로 `/llm/`로 넘어갑니다.
- 새 이론을 추가하려면 폴더를 하나 만들고(`concept-motion-graphic` 스킬), 홈 화면 `index.html`에 카드를 하나 더 넣습니다.
- 영상·PPT 추출은 각 폴더의 `export/`에서 합니다 (`npm i` 후 `node render.mjs clips`, `python3 make_pptx.py`).
