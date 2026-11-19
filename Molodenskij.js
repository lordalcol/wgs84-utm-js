function molodenskij(fromElipsoid, destElipsoid, PHI, LAMBDA, H) {
	// valori dell'ellissoide di partenza
	var alpha = fromElipsoid.alpha;
	var a = fromElipsoid.a;
	// delta
	var Da = fromElipsoid.a - destElipsoid.a;
	var Dalpha = fromElipsoid.alpha - destElipsoid.alpha;
	var DEx = destElipsoid.orientation.Ex - fromElipsoid.orientation.Ex;
	var DEy = destElipsoid.orientation.Ey - fromElipsoid.orientation.Ey;
	var DEz = destElipsoid.orientation.Ez - fromElipsoid.orientation.Ez;
	var Dx0 = destElipsoid.orientation.x0 - fromElipsoid.orientation.x0;
	var Dy0 = destElipsoid.orientation.y0 - fromElipsoid.orientation.y0;
	var Dz0 = destElipsoid.orientation.z0 - fromElipsoid.orientation.z0;
	var DK = destElipsoid.orientation.K - destElipsoid.orientation.K;
	// RHO - Raggio di curvatura del meridiano
	var RHO = fromElipsoid.RHO(LAMBDA);
	// N_G - Gran Normale
	var N_G = fromElipsoid.N_G(LAMBDA);
	
	// scorciatoie
	var sinPHI = Math.sin(PHI);
	var cosPHI = Math.cos(PHI);
	var sinLAMBDA = Math.sin(LAMBDA);
	var cosLAMBDA = Math.cos(LAMBDA);
	var tanLAMBDA = Math.tan(LAMBDA);
	var tempVar = RHO + H;
	var tempVar2 = Math.pow(a,2) / N_G + H;
	var tempVar6 = Math.pow(1 - alpha,2);
	var tempVar5 = (1 - tempVar6) * N_G;
	var tempVar3 = ( N_G + H ) * cosLAMBDA;
	var tempVar4 = (tempVar6 * N_G + H) / (N_G + H);
	var o1 = (sinLAMBDA * cosPHI / tempVar) * Dx0;
	var o2 = (sinLAMBDA * sinPHI / tempVar) * Dy0;
	var o3 = (cosLAMBDA / tempVar) * Dz0;
	var o4 = (tempVar2 / tempVar) * sinPHI * DEx;
	var o5 = (tempVar2 / tempVar) * cosPHI * DEy;
	var o6 = (tempVar5 / tempVar) * cosLAMBDA * sinLAMBDA * ( DK + Da / a);
	var o7 = ((RHO + tempVar6 * N_G) / tempVar) * cosLAMBDA * sinLAMBDA * ( Dalpha / (1 - alpha));
	// delta LAMBDA
	var dLAMBDA = o1+o2-o3+o4-o5-o6-o7;
	// delta PHI
	var dPHI = sinPHI / tempVar3 * Dx0 - cosPHI / tempVar3 * Dy0 - tempVar4 * tanLAMBDA * cosPHI * DEx - tempVar4 * tanLAMBDA * sinPHI * DEy + DEz;
	// delta H
	var dH = - cosLAMBDA * cosPHI * Dx0 - cosLAMBDA * sinPHI * Dy0 - sinLAMBDA * Dz0 + tempVar5 * sinLAMBDA * cosLAMBDA * sinPHI * DEx - tempVar5 * sinLAMBDA * cosLAMBDA * cosPHI * DEy - tempVar2 * DK + a / N_G * Da - tempVar6 * N_G * Math.pow(sinLAMBDA, 2) * (Dalpha / (1 - alpha));
									
	return { LAMBDA: LAMBDA + dLAMBDA, PHI: PHI + dPHI, H: H + dH };
}