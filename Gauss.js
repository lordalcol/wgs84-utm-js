function gauss(surface, m) {
	var precision = 10000;
	var PHI = m.PHI;
	var LAMBDA = m.LAMBDA;
	var H = m.H;
	var a = surface.a;
	var e2 = surface.e2;
	//funzione da integrare
	Integral_Function = function(val) {
		var tempVal = (a * (1 - e2));
		return tempVal/Math.sqrt(Math.pow(1 - e2 * Math.pow(Math.sin(val),2),3));
	}
	// calcolo il fuso e sistemo la longitudine
	var fuse_length = 6 * Math.PI / 180;
	var fuse;
	if (PHI > Math.PI)
		fuse = Math.floor((PHI - Math.PI) / fuse_length);
	else
		fuse = Math.floor((PHI + Math.PI) / fuse_length);
	var deltalength = (fuse - 30) * fuse_length + fuse_length / 2;
	var dPHI = PHI - deltalength;
	// scorciatoie
	var sinLAMBDA = Math.sin(LAMBDA);
	var cosLAMBDA = Math.cos(LAMBDA);
	var tanLAMBDA = Math.tan(LAMBDA);
	var tempVar1 = Math.sqrt(1 - e2 * Math.pow(sinLAMBDA, 2));
	var tempVar2 = Math.pow(e2/Math.sqrt(1 - e2), 2);
	var valoreIntegrale = Integral(Integral_Function, this, 0, LAMBDA, precision);
	// calcolo le coordinate
	var x = valoreIntegrale + (1/2 * a*sinLAMBDA*cosLAMBDA / tempVar1) * Math.pow(dPHI,2) + (1/24 * a*sinLAMBDA*Math.pow(cosLAMBDA, 3)) / tempVar1 * (5 - Math.pow(tanLAMBDA,2) + 9*tempVar2*Math.pow(cosLAMBDA,2) + 4 * Math.pow(tempVar2, 2)* Math.pow(cosLAMBDA,4)) * Math.pow(dPHI,4) + 1/720 * a*sinLAMBDA*Math.pow(cosLAMBDA, 5)/ tempVar1 * (61 - 58*Math.pow(tanLAMBDA,2) + Math.pow(tanLAMBDA, 4) + 270 * tempVar2 * Math.pow(cosLAMBDA, 2) - 330 * tempVar2 * Math.pow(cosLAMBDA, 2) * Math.pow(tanLAMBDA,2)) * Math.pow(dPHI, 6);
	var y = (a * cosLAMBDA / tempVar1) * dPHI + (1/6) * a * Math.pow(cosLAMBDA, 3) / tempVar1 * (1 - Math.pow(tanLAMBDA,2) + tempVar2 * Math.pow(cosLAMBDA, 2)) * Math.pow(dPHI, 3) +(1/120) * a*Math.pow(cosLAMBDA, 5) / tempVar1 * (5 - 18 * Math.pow(tanLAMBDA, 2) + Math.pow(tanLAMBDA, 4) + 14 * tempVar2 * Math.pow(cosLAMBDA, 2) -58 * tempVar2 * Math.pow(cosLAMBDA, 2) * Math.pow(tanLAMBDA, 2)) * Math.pow(dPHI, 5);
	
	return [x,y,H];
}