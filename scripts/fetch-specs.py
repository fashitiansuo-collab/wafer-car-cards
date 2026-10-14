#!/usr/bin/env python3
"""Fetch short specs and flavour text from Wikipedia into a series lineup.

Usage:
    python scripts/fetch-specs.py --series 3 [--only key1,key2] [--dry]

Only uses text actually fetched from Wikipedia; unknown fields are left out.
"""

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

USER_AGENT = "WaferCarCards/0.1 (https://github.com/fashitiansuo-collab/wafer-car-cards)"
EN_API = "https://en.wikipedia.org/w/api.php"
JA_API = "https://ja.wikipedia.org/w/api.php"
LICENSE = "CC BY-SA 4.0"
REQUEST_GAP = 0.5
MAX_VALUE = 40
READING_RE = re.compile(r"[ぁ-んァ-ヶｦ-ﾟー・･\sA-Za-zÀ-ɏ'’.\-=‐―]+")

_last_request = 0.0


def api_get(base, params):
    global _last_request
    url = base + "?" + urllib.parse.urlencode(params)
    backoff = 2.0
    for attempt in range(4):
        gap = REQUEST_GAP - (time.monotonic() - _last_request)
        if gap > 0:
            time.sleep(gap)
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                retry_after = resp.headers.get("Retry-After")
                body = resp.read().decode("utf-8")
                _last_request = time.monotonic()
                if retry_after:
                    try:
                        time.sleep(min(float(retry_after), 30.0))
                    except ValueError:
                        pass
                return json.loads(body)
        except urllib.error.HTTPError as exc:
            _last_request = time.monotonic()
            if exc.code == 429 and attempt < 3:
                wait = backoff
                try:
                    ra = exc.headers.get("Retry-After")
                    if ra is not None:
                        wait = max(wait, min(float(ra), 60.0))
                except (ValueError, TypeError):
                    pass
                time.sleep(wait)
                backoff *= 2.0
                continue
            raise
    raise RuntimeError("API request failed: " + url)


def find_infobox(wikitext):
    m = re.search(r"\{\{\s*(?:infobox\b|racing car\b)", wikitext, re.IGNORECASE)
    if not m:
        return None
    depth, i, n = 0, m.start(), len(wikitext)
    while i < n - 1:
        if wikitext.startswith("{{", i):
            depth += 1
            i += 2
        elif wikitext.startswith("}}", i):
            depth -= 1
            i += 2
            if depth == 0:
                return wikitext[m.start():i]
        else:
            i += 1
    return None


def split_top(text, sep):
    parts, cur = [], []
    tpl = link = 0
    i, n = 0, len(text)
    while i < n:
        two = text[i:i + 2]
        if two == "{{":
            tpl += 1
            cur.append(two)
            i += 2
        elif two == "}}":
            tpl = max(0, tpl - 1)
            cur.append(two)
            i += 2
        elif two == "[[":
            link += 1
            cur.append(two)
            i += 2
        elif two == "]]":
            link = max(0, link - 1)
            cur.append(two)
            i += 2
        elif text[i] == sep and tpl == 0 and link == 0:
            parts.append("".join(cur))
            cur = []
            i += 1
        else:
            cur.append(text[i])
            i += 1
    parts.append("".join(cur))
    return parts


def parse_infobox(template):
    chunks = split_top(template[2:-2], "|")
    params = {}
    for chunk in chunks[1:]:
        bits = split_top(chunk, "=")
        if len(bits) < 2:
            continue
        key = bits[0].strip().lower()
        if key and key not in params:
            params[key] = "=".join(bits[1:]).strip()
    return params


def first_list_item(raw):
    for part in raw.split("|"):
        for chunk in re.split(r"[\n*]+", part):
            item = chunk.strip().lstrip("#:;").strip()
            if item:
                return item
    return ""


def clean_value(raw):
    v = raw or ""
    v = re.sub(r"<!--.*?-->", "", v, flags=re.DOTALL)
    v = re.sub(r"<ref[^>]*>.*?</ref\s*>", "", v, flags=re.DOTALL | re.IGNORECASE)
    v = re.sub(r"<ref[^>]*/>", "", v, flags=re.IGNORECASE)
    v = re.sub(r"<br\s*/?>", " / ", v, flags=re.IGNORECASE)
    v = v.replace("&nbsp;", " ")
    v = re.sub(r"\{\{\s*(?:convert|cvt)\s*\|([^|}]*)\|([^|}]*).*?\}\}",
               lambda m: (m.group(1) + " " + m.group(2)).strip(),
               v, flags=re.IGNORECASE | re.DOTALL)
    v = re.sub(r"\{\{\s*nowrap\s*\|(.*?)\}\}", lambda m: m.group(1),
               v, flags=re.IGNORECASE | re.DOTALL)
    v = re.sub(r"\{\{\s*(?:ubl|plainlist|unbulleted list)\s*\|(.*?)\}\}",
               lambda m: first_list_item(m.group(1)),
               v, flags=re.IGNORECASE | re.DOTALL)
    v = re.sub(r"\[\[(?:[^|\[\]]*\|)?([^\[\]]*)\]\]", r"\1", v)
    while True:
        dropped = re.sub(r"\{\{[^{}]*\}\}", "", v)
        if dropped == v:
            break
        v = dropped
    v = re.sub(r"''+", "", v)
    v = re.sub(r"</?[A-Za-z][^<>]*>", "", v)
    v = re.sub(r"\s+", " ", v).strip()
    chunks = [c.strip() for c in re.split(r" / |\n|\*", v)]
    first = next((c for c in chunks if c), "")
    if len(first) > MAX_VALUE:
        cut = first[:MAX_VALUE]
        if " " in cut:
            cut = cut.rsplit(" ", 1)[0]
        first = cut.rstrip(" ,;:-")
    return first


def fetch_spec(wiki):
    data = api_get(EN_API, {"action": "parse", "prop": "wikitext",
                            "section": "0", "format": "json",
                            "page": wiki, "redirects": "1"})
    wikitext = ((data.get("parse") or {}).get("wikitext") or {}).get("*") or ""
    template = find_infobox(wikitext)
    if not template:
        return None
    params = parse_infobox(template)
    fields = {}
    # {{Racing car}} uses "Engine name" (+ "Capacity") instead of "engine".
    engine = clean_value(params.get("engine", "") or params.get("engine name", ""))
    cap = clean_value(params.get("capacity", ""))
    if engine and cap and cap not in engine:
        engine = (engine + " " + cap)[:40]
    if engine:
        fields["engine"] = engine
    power = clean_value(params.get("power", ""))
    if power:
        fields["power"] = power
    for key in ("weight", "curb_weight", "kerb_weight"):
        weight = clean_value(params.get(key, ""))
        if weight:
            fields["weight"] = weight
            break
    if not fields:
        return None
    fields["source"] = "https://en.wikipedia.org/wiki/" + wiki.replace(" ", "_")
    return fields


def fetch_extract(lang, title):
    base = JA_API if lang == "ja" else EN_API
    data = api_get(base, {"action": "query", "prop": "extracts", "exintro": "1",
                          "explaintext": "1", "redirects": "1",
                          "format": "json", "titles": title})
    pages = (data.get("query") or {}).get("pages") or {}
    for page in pages.values():
        if page.get("missing") is not None:
            return None
        return (page.get("extract") or "").strip() or None
    return None


def take_ja(extract, limit=90):
    text = ""
    stripped = extract.strip()
    ends = stripped.endswith("。")
    for idx, raw in enumerate(stripped.split("。")):
        s = re.sub(r"\s+", " ", raw).strip()
        if not s:
            continue
        piece = s if (idx == len(stripped.split("。")) - 1 and not ends) else s + "。"
        if text and len(text) + len(piece) > limit:
            break
        text += piece
    return text


def take_en(extract, limit=220):
    text = ""
    for raw in extract.split(". "):
        s = re.sub(r"\s+", " ", raw).strip()
        if not s:
            continue
        piece = s if s[-1] in ".!?" else s + "."
        candidate = piece if not text else text + " " + piece
        if text and len(candidate) > limit:
            break
        text = candidate
    return text


def strip_readings(text):
    def drop(m):
        return "" if m.group(1) and READING_RE.fullmatch(m.group(1)) else m.group(0)
    text = re.sub(r"（([^（）]*)）", drop, text)
    text = re.sub(r"\(([^()]*)\)", drop, text)
    return re.sub(r"\s+", " ", text).strip()


def fetch_flavor(wiki, wiki_ja):
    if wiki_ja:
        extract = fetch_extract("ja", wiki_ja)
        if extract:
            text = strip_readings(take_ja(extract))
            if text:
                return {"text": text, "lang": "ja",
                        "source": "https://ja.wikipedia.org/wiki/" + wiki_ja.replace(" ", "_"),
                        "license": LICENSE}
    if wiki:
        extract = fetch_extract("en", wiki)
        if extract:
            text = strip_readings(take_en(extract))
            if text:
                return {"text": text, "lang": "en",
                        "source": "https://en.wikipedia.org/wiki/" + wiki.replace(" ", "_"),
                        "license": LICENSE}
    return None


def process_target(target):
    wiki = target.get("wiki")
    spec = fetch_spec(wiki) if wiki else None
    return spec, fetch_flavor(wiki, target.get("wikiJa"))


def describe(spec, flavor):
    if spec:
        spec_txt = ", ".join("%s=%s" % (k, spec[k])
                             for k in ("engine", "power", "weight") if k in spec)
    else:
        spec_txt = "no spec"
    if flavor:
        flavor_txt = "flavor[%s]: %s" % (flavor["lang"], flavor["text"][:40])
    else:
        flavor_txt = "no flavor"
    return "%s | %s" % (spec_txt, flavor_txt)


def main(argv=None):
    ap = argparse.ArgumentParser(description="Fetch spec/flavor from Wikipedia into a series lineup.")
    ap.add_argument("--series", required=True)
    ap.add_argument("--only", default="")
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args(argv)

    path = Path(__file__).resolve().parent / ("lineup-s%s.json" % args.series)
    try:
        items = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        print("lineup not found: %s" % path, file=sys.stderr)
        return 1
    only = [s for s in args.only.split(",") if s] if args.only else []

    for entry in items:
        if not isinstance(entry, dict):
            continue
        label = entry.get("key") or entry.get("file") or "?"
        if only and entry.get("key") not in only and entry.get("file") not in only:
            print("%s: skipped (--only)" % label)
            continue
        segments = []
        for target in (entry, entry.get("stock")):
            if not isinstance(target, dict):
                continue
            tag = "stock" if target is not entry else ""
            try:
                spec, flavor = process_target(target)
            except Exception as exc:
                print("%s%s: error %s" % (label, " stock" if tag else "", exc))
                continue
            if spec is None:
                target.pop("spec", None)
            else:
                target["spec"] = spec
            if flavor is None:
                target.pop("flavor", None)
            else:
                target["flavor"] = flavor
            piece = describe(spec, flavor)
            segments.append(("%s: %s" % (tag, piece)) if tag else piece)
        print("%s: %s" % (label, " | ".join(segments) if segments else "no wiki"))

    output = json.dumps(items, indent=2, ensure_ascii=False)
    if args.dry:
        print(output)
    else:
        with open(path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(output + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
