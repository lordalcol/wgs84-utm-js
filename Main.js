// funzione per testare il funzionamento (esegue una conversione e confronta con risultati noti)
function test() {
	// preparo le variabili di ingresso (sono in gradi, le converto in radianti)
	var LAMBDA = toRadians(45, 45, 12.20809);
	var PHI = toRadians(14, 1, 30.28015);
	var H = 589;
	// eseguo la conversione
	var converted = convert(PHI, LAMBDA, H);
	// accedo al risultato usando: converted.x, converted.y, converted.h
	// controllo i risultati
	if (Math.round(converted.x) != 5067303) return false;
	if (Math.round(converted.y) != 424247) return false;
	if (Math.round(converted.h) != 547) return false;
	return true;
}

// inizializzo gli ellissoidi noti (DATUM)
var WGS84 = new RotationElipsoid(6378137.0, 1/298.257222101, new Orientation(0,0,0,0,0,0,0));
var ED50 = new RotationElipsoid(6378388, 1/297, new Orientation(-87,-98,-121,0,0,0,0));
var ITA40 = new RotationElipsoid(6378388, 0.00672267002, new Orientation(-104.1,-49.1,-9.9,-11.68,0.971,-2.917,0.714));

// funzione che esegue la conversione completa da WGS84 a ED50
function convert(PHI, LAMBDA, H) {
	var m = molodenskij(WGS84, ED50, PHI, LAMBDA, H);
	var g = gauss(ED50, m);
	// correzione coordinate per UTM
	g[0] = g[0] * 0.9996;
	g[1] = g[1] * 0.9996 + 500000;
	return { x: g[0], y: g[1], h: g[2] };
}

// converte gradi, primi, secondi in radianti
function toRadians(d, m, s) {
	return (Math.PI/180)*(d + m / 60 + s / 3600);
}

// esegue l'integrale definito di di una funzione con il metodo dei trapezi in N parti
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