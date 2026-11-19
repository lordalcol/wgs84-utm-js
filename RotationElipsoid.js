// An ellipsoid of revolution (the reference surface of a datum) and its
// orientation relative to WGS84.
//
// Naming follows the 2008 article: LAMBDA is the latitude and PHI the longitude.
function RotationElipsoid(a, alpha, orientation) {
	this.orientation = orientation;
	this.a = a;          // semi-major axis (m)
	this.alpha = alpha;  // flattening
	var semiminor = this.a - this.a * this.alpha;
	this.e2 = (Math.pow(this.a, 2) - Math.pow(semiminor, 2)) / Math.pow(this.a, 2);
	// RHO: radius of curvature of the meridian
	this.RHO = function (LAMBDA) {
		return this.a * (1 - this.e2) / Math.sqrt(Math.pow(1 - this.e2 * Math.pow(Math.sin(LAMBDA), 2), 3));
	};
	// N_G: radius of curvature of the prime vertical (gran normale)
	this.N_G = function (LAMBDA) {
		return this.a / Math.sqrt(1 - this.e2 * Math.pow(Math.sin(LAMBDA), 2));
	};
}

// Origin shift (m), scale change and rotations (rad) of a datum relative to WGS84.
function Orientation(x0, y0, z0, K, Ex, Ey, Ez) {
	this.z0 = z0; this.x0 = x0; this.y0 = y0;
	this.K = K;
	this.Ex = Ex; this.Ey = Ey; this.Ez = Ez;
}
