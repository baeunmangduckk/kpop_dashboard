# Google Trends CSV 내려받기 안내

Google Trends는 공개 API가 없어(알파 신청제) 화면에서 CSV를 직접 내려받아 이 폴더에 넣습니다.
파일을 넣은 뒤 `npm run import:trends`를 실행하면 `trends.json`과 `global.json`의 국가별 관심도가 실데이터로 바뀝니다.

## 조건 (공통)

- 주소: https://trends.google.co.kr/trends/explore
- 지역: **전 세계**
- 기간: **지난 5년**
- 카테고리: 모든 카테고리 / 검색 유형: 웹 검색

## 받을 파일

| 저장할 이름              | 받는 곳                                 | 검색어                                                               |
| ------------------------ | --------------------------------------- | -------------------------------------------------------------------- |
| `timeline.csv`           | '시간 흐름에 따른 관심도 변화' 카드의 ↓ | `K-pop`, `BTS`, `BLACKPINK`, `Stray Kids`, `PLAVE` 5개를 **한 번에 비교** |
| `geo.csv`                | '지역별 관심도' 카드의 ↓                | `K-pop` **1개만** 입력한 상태                                        |
| `related-BTS.csv`        | '관련 검색어' 카드의 ↓                  | `BTS` 1개만 입력한 상태                                              |
| `related-BLACKPINK.csv`  | 〃                                      | `BLACKPINK` 1개만                                                    |
| `related-Stray Kids.csv` | 〃                                      | `Stray Kids` 1개만                                                   |
| `related-PLAVE.csv`      | 〃                                      | `PLAVE` 1개만                                                        |

- `timeline.csv`만 있어도 실행됩니다. `geo.csv`·`related-*.csv`는 있는 것만 반영합니다.
- 검색어는 '주제'가 아니라 **검색어**로 선택합니다(주제는 언어권별 표기를 합산해 값이 달라집니다).
- 내려받은 파일 이름(`multiTimeline.csv`, `geoMap.csv`, `relatedQueries.csv`)만 위 이름으로 바꾸고 내용은 고치지 않습니다.

## 해석 주의

- 값은 검색량이 아니라 **상대지수**입니다(비교한 검색어·기간 안의 최댓값이 100).
- 5개를 함께 비교한 값이므로, 검색어 구성을 바꾸면 모든 값이 달라집니다. 다시 받을 때도 같은 5개를 유지합니다.
- `<1`은 0.5로 적재합니다.
