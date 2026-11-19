"""Writes tests/fixtures.json: reference coordinates computed with PROJ.

Run with pyproj installed (pip install pyproj): python tests/make-fixtures.py
The tests read the JSON, so they don't need pyproj.

Gauss-Boaga: WGS84 to Roma 40 with EPSG:1660 (Monte Mario to WGS 84 (4)),
then EPSG:3003 (zone 1, West) or EPSG:3004 (zone 2, East).
UTM ED50: WGS84 to ED50 with EPSG:1133 (ED50 to WGS 84 (1)), then UTM.
"""
import json
from pathlib import Path

import pyproj
from pyproj import Transformer

DEG = "+step +proj=unitconvert +xy_in=deg +xy_out=rad"
ROMA40 = ("+step +proj=cart +ellps=WGS84 +step +inv +proj=helmert +x=-104.1 +y=-49.1 +z=-9.9 "
          "+rx=0.971 +ry=-2.917 +rz=0.714 +s=-11.68 +convention=position_vector +step +inv +proj=cart +ellps=intl")
ED50 = "+step +proj=cart +ellps=WGS84 +step +proj=helmert +x=87 +y=98 +z=121 +step +inv +proj=cart +ellps=intl"


def dm(d, m):
    return d + m / 60


POINTS = [
    # name, lat, lon, h
    ("Trieste, the 2008 test point", 45 + 45 / 60 + 12.20809 / 3600, 14 + 1 / 60 + 30.28015 / 3600, 589),
    ("Isola del Giglio, 2010 point 1", dm(42, 21.298), dm(10, 55.439), 0),
    ("Le Scole north 1", dm(42, 21.403), dm(10, 55.677), 0),
    ("Le Scole north 2", dm(42, 21.403), dm(10, 55.715), 0),
    ("Le Scole north 3", dm(42, 21.375), dm(10, 55.677), 0),
    ("Le Scole north 4", dm(42, 21.307), dm(10, 55.715), 0),
    ("Le Scole south 1", dm(42, 21.336), dm(10, 55.720), 0),
    ("Le Scole south 2", dm(42, 21.336), dm(10, 55.791), 0),
    ("Le Scole south 3", dm(42, 21.307), dm(10, 55.720), 0),
    ("Le Scole south 4", dm(42, 21.307), dm(10, 55.791), 0),
    ("Rome, Colosseum", 41.8902, 12.4922, 30),
    ("Milan, Duomo", 45.4642, 9.1900, 120),
    ("Aosta", 45.7370, 7.3201, 580),
    ("Bolzano", 46.4983, 11.3548, 260),
    ("Bologna", 44.4949, 11.3426, 54),
    ("Palermo", 38.1157, 13.3615, 20),
    ("Brindisi", 40.6401, 17.9380, 10),
    ("Otranto, east of 18 E", 40.1440, 18.4910, 15),
]


def run(pipeline, lon, lat, h):
    return Transformer.from_pipeline("+proj=pipeline " + pipeline).transform(lon, lat, h)


out = {"generator": f"PROJ {pyproj.proj_version_str} via pyproj {pyproj.__version__}", "points": []}
for name, lat, lon, h in POINTS:
    west = lon < 12
    cm, fe = (9, 1500000) if west else (15, 2520000)
    gE, gN, _ = run(f"{DEG} {ROMA40} +step +proj=tmerc +lat_0=0 +lon_0={cm} +k=0.9996 +x_0={fe} +y_0=0 +ellps=intl", lon, lat, h)
    _, _, gh = run(f"{DEG} {ROMA40}", lon, lat, h)
    zone = int((lon + 180) // 6) + 1
    uE, uN, _ = run(f"{DEG} {ED50} +step +proj=utm +zone={zone} +ellps=intl", lon, lat, h)
    _, _, uh = run(f"{DEG} {ED50}", lon, lat, h)
    out["points"].append({
        "name": name, "lat": lat, "lon": lon, "h": h,
        "gaussBoaga": {"zone": "Ovest" if west else "Est", "east": round(gE, 4), "north": round(gN, 4), "h": round(gh, 4)},
        "utmEd50": {"zone": zone, "east": round(uE, 4), "north": round(uN, 4), "h": round(uh, 4)},
    })

path = Path(__file__).with_name("fixtures.json")
path.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {len(out['points'])} points to {path}")
