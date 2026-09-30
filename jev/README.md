# Jev는 어떻게 판단할까? — 모션그래픽

TypeSafe Jev(https://docs.typesafe.ai)를 설명하는 3b1b 스타일 스텝형 모션그래픽입니다.
LLM 원리 모션그래픽(`../클로드 마스터클래스/LLM원리_모션그래픽`)과 같은 엔진·룩·버전 선택 방식을 씁니다.

## 쓰는 법
- `index.html` 더블클릭 → 시작 화면에서 버전 선택 (`1` 공학 버전 / `2` 쉬운 버전)
- `→`/`Space`/`PageDown` 다음, `←`/`PageUp` 이전, `V` 버전 전환, `F` 전체화면, `C` 자막, `?` 도움말
- 주소로 바로 열기: `index.html?v=basic`(쉬운) / `index.html?v=full`(공학)
- PPT: `export/Jev_모션그래픽_basic.pptx`(쉬운, 24장) / `export/Jev_모션그래픽.pptx`(공학, 39장)

## 장면
| 공학 | 쉬운 | 장면 | 공학 버전에만 있는 것 |
|---|---|---|---|
| 1 | 1 | 보통 AI는 글로 답해요 | |
| 2 | 2 | 코드와 LLM 사이의 빈칸 | |
| 3 | – | 빠른 생각, System One | 장면 전체 |
| 4 | 3 | Jev는 칸을 채워 줘요 | |
| 5 | – | 요청과 응답의 모양 (state / questions / answers) | 장면 전체 |
| 6 | 4 | 한 번에, 동시에 | ③ 미리 다 묻고 코드가 골라 쓰기 |
| 7 | 5 | 질문 도구 3가지 | ④ Score 계산식 ⑤ Noul에 신뢰도가 없는 이유 |
| 8 | 6 | 신뢰도 | |
| 9 | – | 보정(Calibration) | 장면 전체 |
| 10 | – | 어떻게 훈련했나 (RLHF / RLVR / RLCD) | 장면 전체 |
| 11 | 7 | 신뢰도로 행동 정하기 | |
| 12 | 8 | 어디에 쓸 수 있을까 (use-case map) | |
| 13 | 9 | 잘 쓰는 법 | ③ 세 가지 소프트웨어 구조 |

- 예시는 문서의 이중 결제 환불 문의(주문 A-104)와 신발 쇼핑몰 팀(결제·배송·반품)을 우리말로 옮긴 것입니다.
- 문서에 나온 값: 0.5(잘 모름), 0.9(송금 기준), 약 100ms / 150ms, 약 100배 저렴, 64k 토큰, 입력에만 요금.
- 그 밖의 확률·점수·신뢰도 숫자(91%, 0.97, 1.28, 0.88, 0.85 등)는 이해를 돕기 위한 **예시 값**입니다.

## 다시 뽑기
```bash
cd export
node render.mjs clips               # 공학 버전 스텝별 MP4 → clips/
node render.mjs clips --v basic     # 쉬운 버전 → clips_basic/
python3 make_pptx.py                # 공학 PPTX
python3 make_pptx.py --v basic      # 쉬운 PPTX
node render.mjs snap 3 5.5          # 검수용 스냅샷 (전역 위치)
```
