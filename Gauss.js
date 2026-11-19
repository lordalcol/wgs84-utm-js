// Gauss formulas: projects a point (LAMBDA latitude, PHI longitude) of the
// given ellipsoid onto the plane of its 6-degree UTM zone.
// Returns [northing, easting, height, zone] before the UTM scale factor and
// false origin, which convert() applies.
function gauss(surface, m) {
	var precision = 10000;
	var PHI = m.PHI;
	var LAMBDA = m.LAMBDA;
	var H = m.H;
	var a = surface.a;
	var e2 = surface.e2;
	// the meridian arc is the integral of the meridian radius of curvature
	var integralFunction = function (val) {
		return a * (1 - e2) / Math.sqrt(Math.pow(1 - e2 * Math.pow(Math.sin(val), 2), 3));
	};
	// UTM zone (1 to 60) and longitude from its central meridian
	var zoneWidth = 6 * Math.PI / 180;
	var zone = Math.floor((PHI + Math.PI) / zoneWidth) % 60 + 1;
	var centralMeridian = (zone - 31) * zoneWidth + zoneWidth / 2;
	var dPHI = PHI - centralMeridian;
	// shortcuts
	var sinLAMBDA = Math.sin(LAMBDA);
	var cosLAMBDA = Math.cos(LAMBDA);
	var tanLAMBDA = Math.tan(LAMBDA);
	var tempVar1 = Math.sqrt(1 - e2 * Math.pow(sinLAMBDA, 2));
	// second eccentricity squared, e'^2 = e^2 / (1 - e^2)
	var tempVar2 = e2 / (1 - e2);
	var integralValue = Integral(integralFunction, this, 0, LAMBDA, precision);
	// coordinates
	var x = integralValue + (1/2 * a*sinLAMBDA*cosLAMBDA / tempVar1) * Math.pow(dPHI,2) + (1/24 * a*sinLAMBDA*Math.pow(cosLAMBDA, 3)) / tempVar1 * (5 - Math.pow(tanLAMBDA,2) + 9*tempVar2*Math.pow(cosLAMBDA,2) + 4 * Math.pow(tempVar2, 2)* Math.pow(cosLAMBDA,4)) * Math.pow(dPHI,4) + 1/720 * a*sinLAMBDA*Math.pow(cosLAMBDA, 5)/ tempVar1 * (61 - 58*Math.pow(tanLAMBDA,2) + Math.pow(tanLAMBDA, 4) + 270 * tempVar2 * Math.pow(cosLAMBDA, 2) - 330 * tempVar2 * Math.pow(cosLAMBDA, 2) * Math.pow(tanLAMBDA,2)) * Math.pow(dPHI, 6);
	var y = (a * cosLAMBDA / tempVar1) * dPHI + (1/6) * a * Math.pow(cosLAMBDA, 3) / tempVar1 * (1 - Math.pow(tanLAMBDA,2) + tempVar2 * Math.pow(cosLAMBDA, 2)) * Math.pow(dPHI, 3) +(1/120) * a*Math.pow(cosLAMBDA, 5) / tempVar1 * (5 - 18 * Math.pow(tanLAMBDA, 2) + Math.pow(tanLAMBDA, 4) + 14 * tempVar2 * Math.pow(cosLAMBDA, 2) -58 * tempVar2 * Math.pow(cosLAMBDA, 2) * Math.pow(tanLAMBDA, 2)) * Math.pow(dPHI, 5);

	return [x, y, H, zone];
}
