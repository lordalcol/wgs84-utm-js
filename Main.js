// Converts one point and checks it against known results.
function test() {
	// input in degrees, minutes and seconds, converted to radians
	var LAMBDA = toRadians(45, 45, 12.20809);
	var PHI = toRadians(14, 1, 30.28015);
	var H = 589;
	// convert
	var converted = convert(PHI, LAMBDA, H);
	// the result is in converted.x (north), converted.y (east), converted.h
	if (Math.round(converted.x) != 5067303) return false;
	if (Math.round(converted.y) != 424247) return false;
	if (Math.round(converted.h) != 547) return false;
	return true;
}

// Known datums: ellipsoid and orientation relative to WGS84.
// ED50 uses the mean shift for Europe (EPSG:1133), accurate to a few metres.
var WGS84 = new RotationElipsoid(6378137.0, 1/298.257223563, new Orientation(0,0,0,0,0,0,0));
var ED50 = new RotationElipsoid(6378388, 1/297, new Orientation(-87,-98,-121,0,0,0,0));

// Roma 40 (Monte Mario): the International 1924 ellipsoid with the national
// parameters for mainland Italy (EPSG:1660), accurate to about 4 m. The scale
// change is in parts per million and the rotations in arc seconds; molodenskij()
// expects a ratio and radians, with the rotations in the coordinate frame
// convention, so the signs are the opposite of EPSG's position vector values.
var SECOND = Math.PI / 180 / 3600;
var ROMA40 = new RotationElipsoid(6378388, 1/297, new Orientation(-104.1, -49.1, -9.9, -11.68e-6, -0.971 * SECOND, 2.917 * SECOND, -0.714 * SECOND));

// Converts WGS84 (PHI longitude, LAMBDA latitude in radians, H height in m)
// to UTM coordinates on the ED50 datum.
function convert(PHI, LAMBDA, H) {
	var m = molodenskij(WGS84, ED50, PHI, LAMBDA, H);
	var g = gauss(ED50, m);
	// UTM: scale factor 0.9996, false easting 500 km, and false northing
	// 10,000 km in the southern hemisphere
	var x = g[0] * 0.9996;
	if (LAMBDA < 0) x += 10000000;
	var y = g[1] * 0.9996 + 500000;
	return { x: x, y: y, h: g[2], zone: g[3], hemisphere: LAMBDA < 0 ? 'S' : 'N' };
}

// Converts WGS84 (PHI longitude, LAMBDA latitude in radians, H height in m)
// to Gauss-Boaga coordinates on Roma 40, the grid of Italian regional maps.
// The West zone (Fuso Ovest) is centred on 9 degrees E with a false easting of
// 1500 km, the East zone (Fuso Est) on 15 degrees E with 2520 km; the boundary
// is 12 degrees E.
function convertGaussBoaga(PHI, LAMBDA, H) {
	var m = molodenskij(WGS84, ROMA40, PHI, LAMBDA, H);
	var west = m.PHI < 12 * Math.PI / 180;
	var g = gauss(ROMA40, m, (west ? 9 : 15) * Math.PI / 180);
	var x = g[0] * 0.9996;
	var y = g[1] * 0.9996 + (west ? 1500000 : 2520000);
	return { x: x, y: y, h: g[2], zone: west ? 'Ovest' : 'Est' };
}

// Converts degrees, minutes and seconds to radians. The sign of the degrees
// applies to the whole angle, so -14 1 30 is 14 degrees 1 minute 30 seconds west.
function toRadians(d, m, s) {
	var sign = d < 0 || Object.is(d, -0) ? -1 : 1;
	return sign * (Math.PI/180)*(Math.abs(d) + m / 60 + s / 3600);
}

// Definite integral of a function with the trapezoidal rule in N parts.
function Integral(myFunction, scope, begin, end, parts) {
	var step = (end - begin) / parts;
	var temp = myFunction.call(scope, begin) / 2;
	begin += step;
	for (var c = 0; c < parts - 1; c++) {
		temp += myFunction.call(scope, begin);
		begin += step;
	}
	temp += myFunction.call(scope, begin) / 2;
	return temp*step;
}