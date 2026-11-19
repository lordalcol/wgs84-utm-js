// Checks both grids against PROJ, the library behind most GIS software.
// The reference values are in fixtures.json, written by make-fixtures.py.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ctx = {};
vm.createContext(ctx);
for (const f of ["RotationElipsoid.js", "Molodenskij.js", "Gauss.js", "Main.js"]) {
  vm.runInContext(readFileSync(new URL(`../${f}`, import.meta.url), "utf8"), ctx);
}
const R = Math.PI / 180;
const { points } = JSON.parse(readFileSync(new URL("./fixtures.json", import.meta.url), "utf8"));

for (const p of points) {
  test(`${p.name}: Gauss-Boaga within 1 cm of PROJ`, () => {
    const r = vm.runInContext(`convertGaussBoaga(${p.lon * R}, ${p.lat * R}, ${p.h})`, ctx);
    const ref = p.gaussBoaga;
    assert.equal(r.zone, ref.zone);
    assert.ok(Math.abs(r.y - ref.east) < 0.01, `east off by ${r.y - ref.east}`);
    assert.ok(Math.abs(r.x - ref.north) < 0.01, `north off by ${r.x - ref.north}`);
    assert.ok(Math.abs(r.h - ref.h) < 0.01, `height off by ${r.h - ref.h}`);
  });

  test(`${p.name}: UTM ED50 within 2 cm of PROJ`, () => {
    const r = vm.runInContext(`convert(${p.lon * R}, ${p.lat * R}, ${p.h})`, ctx);
    const ref = p.utmEd50;
    assert.equal(r.zone, ref.zone);
    assert.ok(Math.abs(r.y - ref.east) < 0.02, `east off by ${r.y - ref.east}`);
    assert.ok(Math.abs(r.x - ref.north) < 0.02, `north off by ${r.x - ref.north}`);
    assert.ok(Math.abs(r.h - ref.h) < 0.02, `height off by ${r.h - ref.h}`);
  });
}
