# WGS84 to UTM (ED50) in JavaScript

**[Live demo](https://lorenzodalcol.com/personal-projects/coordinates)** | [How it works](https://lorenzodalcol.com/personal-projects/coordinates/how-it-works.html)

A coordinate converter I wrote in JavaScript in 2008. It takes a WGS84 position, the datum of GPS receivers and Google Maps, and gives its UTM coordinates on ED50, the datum of most European maps drawn before 1984. I wrote it up as an article for *Dev*, an Italian programming magazine published by Infomedia. The article is in [`docs/`](docs) (in Italian).

The converter was online at lordalcol.com/gis for a few years, and surveyors, engineers and a teacher wrote to me about it. In 2010 a surveyor paid me to convert the positions of pipes laid on the seabed off Isola del Giglio, so that he could draw them on the regional maps.

In 2026 I restored it: it now gives the right result everywhere, and there is a new page with a map.

## How it works

Three steps, as in the article:

1. The **Molodensky formulas** move the point from the WGS84 ellipsoid to the ED50 ellipsoid (`Molodenskij.js`).
2. The **Gauss formulas** project it onto the plane of its 6-degree UTM zone (`Gauss.js`). The meridian arc is integrated numerically with the trapezoidal rule in 10,000 steps.
3. `convert()` in `Main.js` applies the UTM scale factor (0.9996) and the false origin: 500 km east, and 10,000 km north in the southern hemisphere.

The [How it works](https://lorenzodalcol.com/personal-projects/coordinates/how-it-works.html) page has the formulas.

In the code `LAMBDA` is the latitude and `PHI` the longitude, as in the article.

## What I fixed in 2026

- **Southern hemisphere.** The false northing was missing, so every point south of the equator came out with a negative northing.
- **WGS84 ellipsoid.** Its flattening was the GRS80 value (1/298.257222101) instead of WGS84's (1/298.257223563). The two differ by 0.1 mm in the semi-minor axis, so the results hardly moved.
- **Second eccentricity.** The Gauss formulas computed e'² as e⁴/(1 − e²) instead of e²/(1 − e²). Near the edge of a zone this put the easting off by up to 14 cm.
- **Scale change.** The difference in scale between the two datums was `dest − dest`, always 0. ED50 has no scale change, so this one never showed.
- **UTM zone.** The zone was worked out but not returned. `convert()` now returns the zone and the hemisphere.
- **Negative angles.** `toRadians(-14, 1, 30)` gave −13° 58′ 30″ instead of −14° 1′ 30″.
- Smaller things: the integrand leaked into a global variable, and the unused ITA40 datum is gone. The comments are now in English.

The ED50 shift is the mean one for Europe (EPSG:1133), so the datum itself is good to a few metres. The arithmetic is now within 1 cm of an exact reference (a geocentric shift, then the Krüger series for the projection) at every test point, from Lisbon to Helsinki and Sydney.

## Running it

Open `index.html` in a browser. The scripts are plain 2008 JavaScript with no build step.

The tests need Node 18 or later:

```
npm test
```

They run the 2008 self-test, the Isola del Giglio point, and eight points around the world against the reference in [`tests/reference.mjs`](tests/reference.mjs).

## Licence

MIT. See [LICENSE](LICENSE).
