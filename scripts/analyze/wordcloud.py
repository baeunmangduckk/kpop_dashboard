"""유튜브 댓글 단어 집계 (감성 워드 클라우드용).

입력: data/raw/youtube/{수집일}/sentiment/*.json  (댓글별 감성 라벨, 로컬 전용)
      data/config/youtube-targets.json            (기준 영상·아티스트 이름)
출력: data/derived/youtube-words.json             (단어와 개수만, 댓글 본문 없음)

실행: .venv/Scripts/python scripts/analyze/wordcloud.py [수집일]
      (먼저 sentiment.py 를 실행해 감성 라벨을 만들어 둔다)
"""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

from kiwipiepy import Kiwi

LABELS = ("positive", "neutral", "negative")
MIN_COMMENTS = 5  # 이보다 적게 나온 단어는 싣지 않음 (특정 댓글이 드러나지 않게)
MIN_VIDEOS = 3  # 이보다 적은 영상에서만 나온 단어는 고유명사로 보고 제외
TOP_N = 60
MIN_LIFT = 1.5  # 중립·부정으로 보려면 그 감성 비중이 전체 평균의 몇 배 이상이어야 하는지
MIN_LEAN_COMMENTS = 3  # 그리고 그 감성의 댓글이 최소 몇 개 있어야 하는지
SMOOTHING = 5  # 색 판정 때 전체 평균 쪽으로 당기는 가상 댓글 수 (적은 표본의 흔들림 완화)

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "raw" / "youtube"
CONFIG = ROOT / "data" / "config" / "youtube-targets.json"
STOPWORDS = Path(__file__).with_name("stopwords_en.txt")
OUT = ROOT / "data" / "derived" / "youtube-words.json"

LATIN = re.compile(r"[a-zà-öø-ÿ]+(?:'[a-z]+)?")
HANGUL = re.compile(r"[가-힣]")
# 명사, 어근, 형용사, 동사만 사용
KIWI_NOUN = {"NNG", "NNP", "XR"}
KIWI_PREDICATE = {"VA", "VV"}
STOPWORDS_KO = {
    "하다", "있다", "되다", "없다", "같다", "보다", "이다", "아니다", "주다", "오다",
    "가다", "나다", "나오다", "알다", "모르다", "말다", "않다", "싶다", "받다", "들다",
    "때문", "정도", "이번", "진짜", "정말", "너무", "우리", "저희", "그것", "이것",
    "하나", "사람", "생각", "노래", "영상", "댓글", "뮤비", "케이팝", "그냥", "지금",
    "오늘", "여기", "거기", "누구", "무엇", "어디", "이거", "그거", "뭔가", "이제",
}  # fmt: skip


def latest_collection() -> str:
    dates = sorted(p.name for p in RAW.iterdir() if (p / "sentiment").is_dir())
    if not dates:
        sys.exit("감성 라벨이 없습니다. 먼저 scripts/analyze/sentiment.py 를 실행하세요.")
    return dates[-1]


def load_stopwords() -> set[str]:
    words: set[str] = set()
    for line in STOPWORDS.read_text(encoding="utf-8").splitlines():
        if not line.startswith("#"):
            words.update(line.split())
    return words


def proper_nouns(config: dict) -> set[str]:
    """아티스트 이름과 영상 제목에 쓰인 단어 (의견이 아니라 이름이라 제외)."""
    names: set[str] = set()
    texts = [c["artist"] for c in config["channels"]]
    texts += [v["title"] for v in config["videos"]]
    for text in texts:
        lowered = text.lower()
        names.update(LATIN.findall(lowered))
        names.update(re.findall(r"[가-힣]+", lowered))
        names.add(re.sub(r"\s+", "", lowered))
    return names


def tokenize(text: str, kiwi: Kiwi, stopwords: set[str]) -> set[str]:
    """댓글 하나에 들어 있는 단어 집합 (한 댓글에서 여러 번 나와도 1회)."""
    words: set[str] = set()
    for token in LATIN.findall(text.lower()):
        token = token.strip("'")
        if len(token) >= 3 and token not in stopwords:
            words.add(token)
    if HANGUL.search(text):
        for token in kiwi.tokenize(text):
            if token.tag in KIWI_NOUN and len(token.form) >= 2:
                word = token.form
            elif token.tag in KIWI_PREDICATE:
                word = token.form + "다"
            else:
                continue
            if HANGUL.search(word) and word not in STOPWORDS_KO:
                words.add(word)
    return words


def lean_of(counts: dict[str, int], baseline: dict[str, float]) -> str:
    """단어의 색. 중립·부정 댓글 비중이 전체 평균보다 뚜렷이 높을 때만 그 감성으로 본다."""
    total = sum(counts.values())
    lift = {
        name: ((counts[name] + SMOOTHING * baseline[name]) / (total + SMOOTHING))
        / baseline[name]
        for name in ("neutral", "negative")
    }
    strong = {
        name: value
        for name, value in lift.items()
        if value >= MIN_LIFT and counts[name] >= MIN_LEAN_COMMENTS
    }
    if strong:
        return max(strong, key=strong.get)
    # 뚜렷한 쏠림이 없으면 긍정 댓글이 절반을 넘을 때만 긍정으로 본다
    if counts["positive"] * 2 > total:
        return "positive"
    return max(lift, key=lift.get)


def aggregate(comments, baseline, exclude, min_videos):
    by_word: dict[str, dict[str, int]] = defaultdict(lambda: dict.fromkeys(LABELS, 0))
    videos_of: dict[str, set[str]] = defaultdict(set)
    for video_id, label, words in comments:
        for word in words:
            by_word[word][label] += 1
            videos_of[word].add(video_id)
    rows = []
    for word, counts in by_word.items():
        total = sum(counts.values())
        if total < MIN_COMMENTS or word in exclude:
            continue
        if len(videos_of[word]) < min_videos:
            continue
        rows.append(
            {"word": word, "count": total, **counts, "lean": lean_of(counts, baseline)}
        )
    rows.sort(key=lambda r: (-r["count"], r["word"]))
    return rows[:TOP_N]


def main() -> None:
    collected = sys.argv[1] if len(sys.argv) > 1 else latest_collection()
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    reference_id = config["referenceVideo"]["id"]
    stopwords = load_stopwords()
    exclude = proper_nouns(config)
    kiwi = Kiwi()

    comments: list[tuple[str, str, set[str]]] = []
    skipped = 0
    for file in sorted((RAW / collected / "sentiment").glob("*.json")):
        for item in json.loads(file.read_text(encoding="utf-8")):
            words = tokenize(item["text"], kiwi, stopwords)
            if not words:
                skipped += 1  # 일본어 등 다른 문자만 있거나 기능어뿐인 댓글
            comments.append((file.stem, item["label"], words))

    total = len(comments)
    baseline = {
        name: sum(1 for _, label, _ in comments if label == name) / total
        for name in LABELS
    }
    scopes = {
        "all": (comments, MIN_VIDEOS),
        "mv": ([c for c in comments if c[0] != reference_id], MIN_VIDEOS),
        # 영상이 하나뿐이라 영상 수 기준은 적용하지 않음
        "reference": ([c for c in comments if c[0] == reference_id], 1),
    }
    kst = timezone(timedelta(hours=9))
    result = {
        "analyzedAt": datetime.now(kst).strftime("%Y-%m-%d"),
        "collectedAt": collected,
        "sampleSize": total,
        "skipped": skipped,
        "minComments": MIN_COMMENTS,
        "minVideos": MIN_VIDEOS,
        "minLift": MIN_LIFT,
        "baseline": {name: round(value, 4) for name, value in baseline.items()},
        "scopes": {
            key: {
                "sampleSize": len(items),
                "words": aggregate(items, baseline, exclude, min_videos),
            }
            for key, (items, min_videos) in scopes.items()
        },
    }
    OUT.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    for key, scope in result["scopes"].items():
        leans = {name: 0 for name in LABELS}
        for row in scope["words"]:
            leans[row["lean"]] += 1
        top = ", ".join(f"{r['word']}({r['count']})" for r in scope["words"][:12])
        print(f"{key}: 댓글 {scope['sampleSize']}개, 단어 {len(scope['words'])}개 {leans}")
        print(f"  {top}")
    print(f"단어를 뽑지 못한 댓글 {skipped}개 → {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
