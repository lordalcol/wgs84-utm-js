function RotationElipsoid(a, alpha, orientation) {
	this.orientation = orientation;
	this.a = a;
	this.alpha = alpha;
	var semiminor = this.a - this.a * this.alpha;
	this.e2 = (Math.pow(this.a,2) - Math.pow(semiminor,2)) / Math.pow(this.a,2);
	// RHO - Raggio di curvatura del meridiano
	this.RHO = function(LAMBDA) {
		return this.a * (1 - this.e2) / Math.sqrt(Math.pow(1 - this.e2 * Math.pow(Math.sin(LAMBDA),2),3));
	}
	// N_G - Gran Normale
	this.N_G = function(LAMBDA) {
		return this.a / Math.sqrt(1 - this.e2 * Math.pow(Math.sin(LAMBDA),2));	
	}
}

function Orientation(x0, y0, z0, K, Ex, Ey, Ez) {
	this.z0 = z0;	this.x0 = x0;	this.y0 = y0;
	this.K = K;
	this.Ex = Ex;	this.Ey = Ey;	this.Ez = Ez;
}