#!/usr/bin/env python3
"""board.py - a departure board for one station.

Joins the federation timetable at api.nrf.rof to the Podnik position feed at
api.podnik.rof on the service identifier. No key is needed for either.

Public domain under Article 10 of the Constitution of the Republic of Fluid.
Written for the shelter boards a commune runs off a single-board computer.
"""

import sys
import time
import urllib.request
import json

NRF = "https://api.nrf.rof/v1"
PODNIK = "https://api.podnik.rof/v1"
STOP = sys.argv[1] if len(sys.argv) > 1 else "LIN-CTR"

_etags = {}


def get(url):
    """Conditional GET. A 304 costs nothing and nothing is counted."""
    req = urllib.request.Request(url)
    if url in _etags:
        req.add_header("If-None-Match", _etags[url][0])
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            body = json.load(r)
            if r.headers.get("ETag"):
                _etags[url] = (r.headers["ETag"], body)
            return body
    except urllib.error.HTTPError as e:
        if e.code == 304:
            return _etags[url][1]
        raise


def board(stop):
    table = get(f"{NRF}/timetable?stop={stop}")
    live = get(f"{PODNIK}/journeys?stop={stop}")
    positions = {j["service"]: j for j in live.get("journeys", [])}

    rows = []
    for dep in table["departures"]:
        j = positions.get(dep["service"])
        if j is None:
            # No vehicle reporting. Show the published time and say so.
            rows.append((dep["published"][11:16], dep["destination"],
                         dep["platform"], "timetable only"))
            continue
        eta = j["eta"][11:16]
        margin = j.get("uncertainty_s")
        late = j.get("delay_s", 0) // 60
        note = f"+/- {margin} s" if margin else ""
        if late > 10:
            note = f"{late} min down, " + note
        rows.append((eta, dep["destination"], dep["platform"], note))
    return rows


def main():
    while True:
        for eta, dest, platform, note in board(STOP)[:8]:
            print(f"{eta}  {dest:<12} pl {platform:<2} {note}")
        print("-" * 40)
        time.sleep(10)          # the feed is regenerated every 10 s


if __name__ == "__main__":
    main()
