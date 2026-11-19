import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { wgs84ToEd50Utm } from "./reference.mjs";

// Load the 2008 scripts the way a browser does: into one global scope.
const ctx = {};
vm.createContext(ctx);
for (const f of ["RotationElipsoid.js", "Molodenskij.js", "Gauss.js", "Main.js"]) {
  vm.runInContext(readFileSync(new URL(`../${f}`, import.meta.url), "utf8"), ctx);
}
const R = Math.PI / 180;
const convert = (lat, lon, h) => vm.runInContext(`convert(${lon * R}, ${lat * R}, ${h})`, ctx);

test("the 2008 self-test passes", () => {
  assert.equal(ctx.test(), true);
});

test("the 2010 Isola del Giglio point gives the coordinates sent to the client", () => {
  const r = convert(42 + 21.298 / 60, 10 + 55.439 / 60, 0);
  assert.equal(Math.round(r.x), 4691177);
  assert.equal(Math.round(r.y), 658538);
  assert.equal(r.zone, 32);
});

const points = [
  ["Trieste", 45.7533911, 14.0250778, 589],
  ["Rome", 41.9028, 12.4964, 50],
  ["near the zone 31/32 edge", 46, 5.99, 0],
  ["Madrid, west of Greenwich", 40.4168, -3.7038, 650],
  ["Lisbon", 38.7223, -9.1393, 100],
  ["Helsinki", 60.1699, 24.9384, 20],
  ["Sydney, southern hemisphere", -33.8688, 151.2093, 0],
  ["Buenos Aires, south and west", -34.6037, -58.3816, 25],
];
for (const [name, lat, lon, h] of points) {
  test(`${name} matches the reference within 2 cm`, () => {
    const r = convert(lat, lon, h);
    const ref = wgs84ToEd50Utm(lat, lon, h);
    assert.equal(r.zone, ref.zone);
    assert.equal(r.hemisphere, lat < 0 ? "S" : "N");
    assert.ok(Math.abs(r.x - ref.N) < 0.02, `north off by ${r.x - ref.N}`);
    assert.ok(Math.abs(r.y - ref.E) < 0.02, `east off by ${r.y - ref.E}`);
    assert.ok(Math.abs(r.h - ref.h) < 0.05, `height off by ${r.h - ref.h}`);
  });
}

test("negative degrees with minutes and seconds are west or south", () => {
  const west = vm.runInContext("toRadians(-14, 1, 30)", ctx);
  assert.ok(Math.abs(west + (14 + 1 / 60 + 30 / 3600) * R) < 1e-12);
  const minusZero = vm.runInContext("toRadians(-0, 30, 0)", ctx);
  assert.ok(Math.abs(minusZero + 0.5 * R) < 1e-12);
});
