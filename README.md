# WGS84 to UTM (ED50) and Gauss-Boaga in JavaScript

**[Live demo](https://lorenzodalcol.com/personal-projects/coordinates)** | [How it works](https://lorenzodalcol.com/personal-projects/coordinates/how-it-works.html)

A coordinate converter I wrote in JavaScript in 2008. It takes a WGS84 position, the datum of GPS receivers and Google Maps, and gives its UTM coordinates on ED50, the datum of most European maps drawn before 1984. I wrote it up as an article for *Dev*, an Italian programming magazine published by Infomedia. The article is in [`docs/`](docs) (in Italian).

The converter was online at lordalcol.com/gis for a few years, and surveyors, engineers and a teacher wrote to me about it. In 2010 a surveyor paid me to convert the positions of pipes laid on the seabed off Isola del Giglio, so that he could draw them on the regional maps.

In 2026 I restored it: it now gives the right result everywhere, it also converts to Gauss-Boaga on Roma 40, the grid of Italian maps, and there is a new page with a map.

## How it works

Three steps, as in the article:

1. The **Molodensky formulas** move the point from the WGS84 ellipsoid to the ED50 ellipsoid (`Molodenskij.js`).
2. The **Gauss formulas** project it onto the plane of its 6-degree UTM zone (`Gauss.js`). The meridian arc is integrated numerically with the trapezoidal rule in 10,000 steps.
3. `convert()` in `Main.js` applies the UTM scale factor (0.9996) and the false origin: 500 km east, and 10,000 km north in the southern hemisphere.

`convertGaussBoaga()` does the same for Gauss-Boaga: Molodensky to Roma 40 with the national parameters for mainland Italy (EPSG:1660), then Gauss with the West zone (9° E, false easting 1 500 km) or the East zone (15° E, 2 520 km).

The [How it works](https://lorenzodalcol.com/personal-projects/coordinates/how-it-works.html) page has the formulas, and the eight Isola del Giglio points a surveyor asked me to convert to Gauss-Boaga in 2012.

In the code `LAMBDA` is the latitude and `PHI` the longitude, as in the article.

## What I fixed in 2026

- In the southern hemisphere the false northing was missing, so every point south of the equator came out with a negative northing.
- The WGS84 flattening was the GRS80 value (1/298.257222101) instead of WGS84's (1/298.257223563). The two differ by 0.1 mm in the semi-minor axis, so the results hardly moved.
- The Gauss formulas computed e'² as e⁴/(1 − e²) instead of e²/(1 − e²). Near the edge of a zone this put the easting off by up to 14 cm.
- The difference in scale between the two datums was `dest − dest`, always 0, and the latitude formula applied it with the wrong sign. ED50 has no scale change, so neither showed; with Roma 40 the second one put northings 0.49 m off.
- The UTM zone was worked out but not returned. `convert()` now returns the zone and the hemisphere.
- `toRadians(-14, 1, 30)` gave −13° 58′ 30″ instead of −14° 1′ 30″.
- Smaller things: the integrand leaked into a global variable, and the commented-out ITA40 datum, which had the wrong units, is replaced by a working Roma 40. The comments are now in English.

The ED50 shift is the mean one for Europe (EPSG:1133), so the datum itself is good to a few metres. The Roma 40 parameters are good to about 4 m on the mainland. The arithmetic is now within 1 cm of an exact reference (a geocentric shift, then the Krüger series for the projection) at every test point, from Lisbon to Helsinki and Sydney, and within 3 mm of [PROJ](https://proj.org) for both grids at 18 points in Italy.

## Running it

There is no build step. Serve the folder (for example `python -m http.server`) and open:

- `index.html`, the 2026 page: a form and an OpenStreetMap map (with [Leaflet](https://leafletjs.com)). Click the map or type a position, pick UTM or Gauss-Boaga, and it converts it with the 2008 scripts. The address keeps the point (`?lat=42.355&lon=10.924`, plus `&grid=gb` for Gauss-Boaga), so a result can be shared as a link.
- `how-it-works.html`, the formulas, typeset with [KaTeX](https://katex.org).
- `2008.html`, the original 2008 page.

Leaflet and KaTeX are in `vendor/`, with their licences. The map tiles come from the OpenStreetMap tile servers, which need no key.

The tests need Node 18 or later:

```
npm test
```

They run the 2008 self-test, the Isola del Giglio point, eight points around the world against the reference in [`tests/reference.mjs`](tests/reference.mjs), and 18 points in Italy against PROJ. The PROJ values are in `tests/fixtures.json`; `tests/make-fixtures.py` writes them again (it needs `pip install pyproj`).

## Licence

MIT. See [LICENSE](LICENSE).
