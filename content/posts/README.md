# 리메이트 블로그 글

리메이트(retire-mates.com) 블로그에 올릴 글이에요. 한 파일이 글 한 편이에요. 확인일: 2026.11.25

## 파일 구조

파일마다 맨 위에 발행 정보가 있고, 그 아래가 사이트에 나갈 본문이에요.

| 필드 | 뜻 |
| --- | --- |
| id | 글 번호 (n1~) |
| slug | 주소. `/blog/{slug}` |
| category | 카테고리 4개 중 하나 |
| title | 글 제목 (본문 첫 줄 `#`와 같음) |
| seo_title | 검색 결과에 나갈 제목 (`<title>`) |
| seo_description | 검색 결과에 나갈 설명 (`meta description`) |
| keywords | 핵심 검색어 |
| calculator | 글과 연결할 계산기 입력칸 |
| checked | 마지막으로 내용을 확인한 날 |
| thumbnail | 대표 이미지 장면 (선택: `/ 글자: …` — 그림 파일이 아직 없을 때만 회색 칸에 대신 보이는 글자) |

## 본문 안의 약속

- `> **메이트 팁** …` 인용 블록은 팁 박스로 보여주세요.
- `버튼: **…**` 줄은 계산기로 가는 버튼이에요. 굵은 글씨가 버튼 문구이고, calculator 필드의 입력칸으로 연결해요.
- `## 출처`는 글 맨 아래에 작은 글씨로 보여주세요.
- "(계산)"은 리메이트가 발표 수치로 직접 계산한 값이라는 검수용 표시예요. 원고에는 남겨 두세요. 화면에서는 본문에서 빠지고, 출처의 `- (계산) …` 줄은 "계산식: …"으로 보여요(2026.11.27부터, `build_posts.py`가 자동 처리).

## 카테고리 (블로그 상단 칩)

전체 · 은퇴 시기 · 은퇴 자금 · 은퇴 후 삶 · 은퇴 후 건강

## 썸네일 공통 스타일

- 16:9 비율. 첫 화면 "먼저 읽어보세요" 정사각 카드로 잘려도 보이게, 사람은 가운데 쪽에 둬요.
- 단순한 플랫 일러스트. 사람 얼굴은 눈·입 없이 단순하게 그려요. 한 장에 1~2명.
- 배경은 카테고리마다 정한 단색 한 가지.
- 그림 안에는 글자와 숫자를 넣지 않아요(2026.11.27 결정).
- 통장, 고지서, 간판에 진짜 은행·기관 이름이나 로고를 넣지 않아요.

## 글 목록

| id | 카테고리 | 제목 | slug |
| --- | --- | --- | --- |
| n1 | 은퇴 시기 | 나는 몇 살까지 회사에 다닐 수 있을까? | retirement-age-53 |
| n6 | 은퇴 시기 | 몇 살까지 쓸 돈을 준비해야 할까? | how-long-to-plan-for |
| n10 | 은퇴 시기 | 연금 받기 전 12년, 무엇으로 버틸까? | income-gap-before-pension |
| n19 | 은퇴 시기 | 국민연금, 늦게 받으면 얼마나 더 받을까? | deferred-national-pension |
| n22 | 은퇴 자금 | 퇴직금, 언제 어떻게 받아야 세금이 줄까? | severance-pay-tax |
| n26 | 은퇴 자금 | 희망퇴직 위로금, 세금은 얼마이고 실업급여는 받을 수 있을까? | voluntary-retirement-package |
| n3 | 은퇴 자금 | 은퇴 생활비, 한 달에 얼마면 될까 | retirement-living-cost |
| n4 | 은퇴 자금 | 우리 집 순자산, 또래와 비교하면 어느 정도일까? | net-worth-by-age |
| n5 | 은퇴 자금 | 물가가 오르면 은퇴 자금은 | inflation-retirement |
| n8 | 은퇴 자금 | 은퇴한 집, 생활비는 충분할까? | retired-household-living-cost |
| n9 | 은퇴 자금 | 조기은퇴, 도대체 얼마면 될까? | early-retirement-how-much |
| n11 | 은퇴 자금 | 은퇴하면 건강보험료는 어떻게 바뀔까? | health-insurance-after-retirement |
| n13 | 은퇴 자금 | 다른 사람들은 연금을 얼마나 받을까? | pension-amount-average |
| n25 | 은퇴 자금 | 연금저축·IRP, 한 달에 얼마씩 넣어야 할까? | pension-savings-irp-how-much |
| n27 | 은퇴 자금 | 40대 순자산 평균·중위값, 우리 집은 몇 등일까? | net-worth-40s |
| n28 | 은퇴 자금 | 30대 순자산 평균·중위값, 나는 어디쯤일까? | net-worth-30s |
| n2 | 은퇴 후 삶 | 원하는 노후와 실제 노후, 얼마나 다를까 | retirement-wish-vs-reality |
| n7 | 은퇴 후 삶 | 은퇴하면 하루를 어떻게 보낼까? | life-after-retirement |
| n12 | 은퇴 후 삶 | 50대 이후, 사람들은 어떤 자격증에 도전할까? | certificates-after-50 |
| n14 | 은퇴 후 삶 | 은퇴하면 어디서 살까? | where-to-live-after-retirement |
| n15 | 은퇴 후 삶 | 부모의 노후, 이제는 누가 책임질까? | parents-retirement |
| n16 | 은퇴 후 삶 | 은퇴하면 외로워질까? | loneliness-after-retirement |
| n17 | 은퇴 후 삶 | 은퇴 후 창업, 해도 될까? | starting-business-after-retirement |
| n18 | 은퇴 후 건강 | 아프며 사는 시간은 얼마나 될까? | healthy-life-expectancy |
| n20 | 은퇴 후 건강 | 치매, 얼마나 걱정해야 할까? | dementia-after-retirement |
| n21 | 은퇴 후 건강 | 우리는 운동을 얼마나 하고 있을까? | exercise-before-retirement |
| n23 | 은퇴 후 건강 | 은퇴 후 병원비는 얼마나 들까? | medical-costs-after-retirement |
| n24 | 은퇴 후 건강 | 장기요양, 언제 어떻게 받을 수 있을까? | long-term-care-insurance |

## 발행 전 한 번 더 볼 것

- 2026.11.26 확인 완료: n10 실업급여 하루 상한액 6만 8,100원은 2026년 1월 1일 이후 퇴사자 기준이 맞아요. 2027년 최저임금이 오르면 상한액도 바뀔 수 있어서, 2027년 초에 다시 봐요.
- n24 장기요양: 2027년 한도 인상(1등급 289만 1,400원)을 넣었어요. 2027년 1월 고시가 나오면 표를 2027년 기준으로 바꿔요.
