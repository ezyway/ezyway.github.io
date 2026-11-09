#!/usr/bin/env python3
"""Fetch the live RezMon download count from GNOME Extensions.

GNOME Extensions does not send CORS headers, so browser-side fetches are
blocked. This script runs in a scheduled GitHub Action instead and writes a
same-origin snapshot to js/rezmon-stats.json, which js/stats.js reads.

The file is only rewritten when the download count actually changes, keeping
the commit history free of no-op updates.
"""

import json
import os
import sys
import urllib.request
from datetime import datetime, timezone

EXTENSION_PK = os.environ.get("REZMON_EXTENSION_PK", "6952")
SOURCE_URL = f"https://extensions.gnome.org/extension-info/?pk={EXTENSION_PK}"
OUTPUT_PATH = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "js", "rezmon-stats.json")
)
USER_AGENT = "ezyway-portfolio-stats/1.0 (+https://ezyway.github.io/)"


def fetch_downloads():
    request = urllib.request.Request(SOURCE_URL, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.load(response)

    downloads = payload.get("downloads")
    if not isinstance(downloads, int) or downloads <= 0:
        raise ValueError(f"unexpected downloads value: {downloads!r}")
    return downloads


def read_existing():
    try:
        with open(OUTPUT_PATH, encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, ValueError):
        return None


def main():
    try:
        downloads = fetch_downloads()
    except Exception as exc:  # noqa: BLE001 - keep the last good value on any failure
        print(f"::warning::Could not fetch RezMon stats: {exc}", file=sys.stderr)
        return 0

    existing = read_existing()
    if existing and existing.get("downloads") == downloads:
        print(f"Download count unchanged at {downloads}; nothing to write.")
        return 0

    previous = existing.get("downloads") if existing else None
    snapshot = {
        "project": "rezmon",
        "extensionPk": int(EXTENSION_PK),
        "downloads": downloads,
        "generatedAt": datetime.now(timezone.utc)
        .isoformat(timespec="seconds")
        .replace("+00:00", "Z"),
        "source": SOURCE_URL,
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as handle:
        json.dump(snapshot, handle, indent=2)
        handle.write("\n")

    print(f"Updated RezMon downloads: {previous} -> {downloads}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
