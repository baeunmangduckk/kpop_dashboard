"""유튜브 댓글 감성 분류 (긍정·중립·부정).

입력: data/raw/youtube/{수집일}/comments/*.json  (로컬 전용, 저장소에 올리지 않음)
출력: data/derived/youtube-sentiment.json         (영상별·전체 개수만, 댓글 본문 없음)
      data/raw/youtube/{수집일}/sentiment/*.json   (댓글별 라벨·확률, 로컬 검증용)

실행: .venv/Scripts/python scripts/analyze/sentiment.py [수집일]
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

MODEL = "cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual"
LABELS = ("positive", "neutral", "negative")
BATCH_SIZE = 16
MAX_TOKENS = 256

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "raw" / "youtube"
OUT = ROOT / "data" / "derived" / "youtube-sentiment.json"


def latest_collection() -> str:
    dates = sorted(p.name for p in RAW.iterdir() if (p / "comments").is_dir())
    if not dates:
        sys.exit("댓글 원본이 없습니다. 먼저 npm run collect:youtube 를 실행하세요.")
    return dates[-1]


def classify(texts: list[str], tokenizer, model) -> list[dict]:
    """댓글 목록을 배치로 분류해 라벨과 확률을 돌려준다."""
    id2label = {i: name.lower() for i, name in model.config.id2label.items()}
    results: list[dict] = []
    for start in range(0, len(texts), BATCH_SIZE):
        batch = texts[start : start + BATCH_SIZE]
        encoded = tokenizer(
            batch,
            padding=True,
            truncation=True,
            max_length=MAX_TOKENS,
            return_tensors="pt",
        )
        with torch.no_grad():
            probs = torch.softmax(model(**encoded).logits, dim=-1)
        for row in probs:
            scores = {id2label[i]: round(float(p), 4) for i, p in enumerate(row)}
            results.append({"label": max(scores, key=scores.get), "scores": scores})
    return results


def main() -> None:
    collected = sys.argv[1] if len(sys.argv) > 1 else latest_collection()
    comment_dir = RAW / collected / "comments"
    detail_dir = RAW / collected / "sentiment"
    detail_dir.mkdir(parents=True, exist_ok=True)

    tokenizer = AutoTokenizer.from_pretrained(MODEL)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL)
    model.eval()

    videos = []
    for file in sorted(comment_dir.glob("*.json")):
        data = json.loads(file.read_text(encoding="utf-8"))
        # 공백뿐인 댓글은 분류 대상에서 제외
        comments = [c for c in data["comments"] if c["text"].strip()]
        labeled = classify([c["text"] for c in comments], tokenizer, model)

        counts = {name: 0 for name in LABELS}
        for item in labeled:
            counts[item["label"]] += 1
        videos.append(
            {"videoId": data["videoId"], "sampleSize": len(comments), **counts}
        )

        detail = [
            {"id": c["id"], "text": c["text"], **item}
            for c, item in zip(comments, labeled)
        ]
        (detail_dir / file.name).write_text(
            json.dumps(detail, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"{data['videoId']}: {len(comments)}개 {counts}")

    total = {name: sum(v[name] for v in videos) for name in LABELS}
    kst = timezone(timedelta(hours=9))
    summary = {
        "model": MODEL,
        "analyzedAt": datetime.now(kst).strftime("%Y-%m-%d"),
        "collectedAt": collected,
        "sampleSize": sum(v["sampleSize"] for v in videos),
        **total,
        "videos": videos,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"\n전체 {summary['sampleSize']}개 {total}")
    print(f"→ {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
