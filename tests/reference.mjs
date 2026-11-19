// Independent reference for the tests: exact geocentric datum shift, then the
// Krueger series for the transverse Mercator projection (accurate to well under 1 mm).
const D = Math.PI / 180;
export function toEcef(lat, lon, h, a, f) {
  const e2 = f * (2 - f), N = a / Math.sqrt(1 - e2 * Math.sin(lat) ** 2);
  return [(N + h) * Math.cos(lat) * Math.cos(lon), (N + h) * Math.cos(lat) * Math.sin(lon), (N * (1 - e2) + h) * Math.sin(lat)];
}
export function fromEcef([x, y, z], a, f) {
  const e2 = f * (2 - f), p = Math.hypot(x, y), lon = Math.atan2(y, x);
  let lat = Math.atan2(z, p * (1 - e2)), h = 0;
  for (let i = 0; i < 10; i++) { const N = a / Math.sqrt(1 - e2 * Math.sin(lat) ** 2); h = p / Math.cos(lat) - N; lat = Math.atan2(z, p * (1 - e2 * N / (N + h))); }
  return [lat, lon, h];
}
export function tm(lat, lon, lon0, a, f, k0 = 0.9996) {
  const n = f / (2 - f), A = a / (1 + n) * (1 + n * n / 4 + n ** 4 / 64);
  const al = [0, n/2 - 2*n*n/3 + 5*n**3/16 + 41*n**4/180, 13*n*n/48 - 3*n**3/5 + 557*n**4/1440, 61*n**3/240 - 103*n**4/140, 49561*n**4/161280];
  const e = Math.sqrt(f * (2 - f));
  const t = Math.sinh(Math.atanh(Math.sin(lat)) - e * Math.atanh(e * Math.sin(lat)));
  const xi = Math.atan2(t, Math.cos(lon - lon0)), eta = Math.atanh(Math.sin(lon - lon0) / Math.sqrt(1 + t * t));
  let X = xi, Y = eta;
  for (let j = 1; j <= 4; j++) { X += al[j] * Math.sin(2*j*xi) * Math.cosh(2*j*eta); Y += al[j] * Math.cos(2*j*xi) * Math.sinh(2*j*eta); }
  return { N: k0 * A * X, E: 500000 + k0 * A * Y };
}
export function wgs84ToEd50Utm(latDeg, lonDeg, h) {
  const [x, y, z] = toEcef(latDeg * D, lonDeg * D, h, 6378137, 1 / 298.257223563);
  const [lat, lon, hh] = fromEcef([x + 87, y + 98, z + 121], 6378388, 1 / 297); // ED50 = WGS84 + (87, 98, 121)
  const zone = Math.floor((lonDeg + 180) / 6) + 1, lon0 = ((zone - 1) * 6 - 180 + 3) * D;
  const r = tm(lat, lon, lon0, 6378388, 1 / 297);
  if (latDeg < 0) r.N += 10000000;
  return { ...r, h: hh, zone, lat: lat / D, lon: lon / D };
}
