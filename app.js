// The page around the 2008 converter: reads the form or a click on the map,
// calls convert() from Main.js and shows the result.
(function () {
  "use strict";

  var DEG = Math.PI / 180;
  var $ = function (id) { return document.getElementById(id); };

  // Accepts "45 45 12.2", "45°45'12.2\"", "45.7534", "-14 1 30" or "14 1 30 W".
  // Returns decimal degrees, or NaN.
  function parseAngle(text, positive, negative) {
    var s = String(text).trim().toUpperCase().replace(/,/g, ".");
    if (!s) return NaN;
    var sign = 1;
    var letter = s.match(/[NSEW]$/) || s.match(/^[NSEW]/);
    if (letter) {
      if (letter[0] === negative) sign = -1;
      else if (letter[0] !== positive) return NaN;
      s = s.replace(/[NSEW]/, "");
    }
    s = s.trim();
    if (s.charAt(0) === "-") { sign = -sign; s = s.slice(1); }
    else if (s.charAt(0) === "+") s = s.slice(1);
    var parts = s.split(/[\s°º'′"″]+/).filter(Boolean);
    if (parts.length < 1 || parts.length > 3) return NaN;
    var nums = parts.map(Number);
    if (nums.some(function (n) { return !isFinite(n) || n < 0; })) return NaN;
    if (nums.length > 1 && (nums[1] >= 60 || (nums.length > 2 && nums[2] >= 60))) return NaN;
    return sign * (nums[0] + (nums[1] || 0) / 60 + (nums[2] || 0) / 3600);
  }

  function formatMetres(v) {
    return Math.round(v).toLocaleString("en-GB").replace(/,/g, " ") + " m";
  }

  // Leaflet map with OpenStreetMap tiles. No API key needed; the tile usage
  // policy asks for the attribution, which Leaflet shows in the corner.
  var map = L.map("map", { worldCopyJump: true }).setView([45.7534, 14.0251], 6);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  var marker = null;

  // The grid: "utm" for UTM on ED50, "gb" for Gauss-Boaga on Roma 40.
  function grid() {
    return document.querySelector('input[name="grid"]:checked').value;
  }
  function setGrid(value) {
    var input = document.querySelector('input[name="grid"][value="' + value + '"]');
    if (input) input.checked = true;
    var gb = grid() === "gb";
    $("result-title").textContent = gb ? "Gauss-Boaga on Roma 40" : "UTM on ED50";
    $("height-label").textContent = gb ? "Roma 40 height" : "ED50 height";
  }

  function show(lat, lon, h, pan) {
    var error = $("error");
    lon = ((lon + 540) % 360) - 180;
    var gb = grid() === "gb";
    if (gb && !(lat >= 35 && lat <= 48 && lon >= 5.5 && lon <= 19)) {
      error.textContent = "Gauss-Boaga is the grid of Italian maps: pick a point in Italy, or switch to UTM.";
      error.hidden = false;
      return;
    }
    if (!(lat >= -80 && lat <= 84)) {
      error.textContent = "UTM covers latitudes from 80° S to 84° N.";
      error.hidden = false;
      return;
    }
    error.hidden = true;

    var r = gb ? convertGaussBoaga(lon * DEG, lat * DEG, h) : convert(lon * DEG, lat * DEG, h);
    var zone = gb ? r.zone + (r.zone === "Ovest" ? " (West)" : " (East)") : r.zone + " " + r.hemisphere;
    $("zone").textContent = zone;
    $("east").textContent = formatMetres(r.y);
    $("north").textContent = formatMetres(r.x);
    $("height").textContent = formatMetres(r.h);

    var label = "<strong>" + (gb ? "GB " + r.zone : r.zone + r.hemisphere) + "</strong> " + Math.round(r.y) + " E, " + Math.round(r.x) + " N";
    if (marker) marker.setLatLng([lat, lon]).setPopupContent(label);
    else {
      marker = L.marker([lat, lon], { draggable: true }).addTo(map).bindPopup(label);
      marker.on("dragend", function () {
        var p = marker.getLatLng();
        fill(p.lat, p.lng);
        show(p.lat, p.lng, readHeight(), false);
      });
    }
    marker.openPopup();
    // Keep the address in step with the converted point, so it can be shared.
    var q = "?lat=" + lat.toFixed(6) + "&lon=" + lon.toFixed(6) + "&h=" + h + (gb ? "&grid=gb" : "");
    history.replaceState(null, "", location.pathname + q);
    if (pan) map.setView([lat, lon], Math.max(map.getZoom(), 13));
  }

  function readHeight() {
    var h = Number(String($("h").value).replace(",", "."));
    return isFinite(h) ? h : 0;
  }

  function fill(lat, lon) {
    $("lat").value = lat.toFixed(6);
    $("lon").value = lon.toFixed(6);
  }

  $("form").addEventListener("submit", function (e) {
    e.preventDefault();
    var lat = parseAngle($("lat").value, "N", "S");
    var lon = parseAngle($("lon").value, "E", "W");
    var h = Number(String($("h").value).replace(",", ".") || 0);
    var error = $("error");
    if (isNaN(lat) || isNaN(lon) || !isFinite(h)) {
      error.textContent = "Check the numbers: for example 45 45 12.2 or 45.7534.";
      error.hidden = false;
      return;
    }
    show(lat, lon, h, true);
  });

  map.on("click", function (e) {
    fill(e.latlng.lat, e.latlng.wrap().lng);
    show(e.latlng.lat, e.latlng.wrap().lng, readHeight(), false);
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-lat]"), function (b) {
    b.addEventListener("click", function () {
      $("lat").value = b.dataset.lat;
      $("lon").value = b.dataset.lon;
      $("h").value = b.dataset.h;
      setGrid(b.dataset.grid || "utm");
      show(parseAngle(b.dataset.lat, "N", "S"), parseAngle(b.dataset.lon, "E", "W"), Number(b.dataset.h), true);
    });
  });

  // A position in the address, for example ?lat=42.355&lon=10.924&h=0, is
  // converted on load, so a result can be shared as a link. &grid=gb picks
  // Gauss-Boaga.
  var query = new URLSearchParams(location.search);
  if (query.has("lat") && query.has("lon")) {
    $("lat").value = query.get("lat");
    $("lon").value = query.get("lon");
    if (query.has("h")) $("h").value = query.get("h");
    setGrid(query.get("grid") === "gb" ? "gb" : "utm");
    $("form").requestSubmit();
  }

  // Switching grid converts the current point again.
  Array.prototype.forEach.call(document.querySelectorAll('input[name="grid"]'), function (input) {
    input.addEventListener("change", function () {
      setGrid(grid());
      if (marker) {
        var p = marker.getLatLng();
        show(p.lat, p.lng, readHeight(), false);
      }
    });
  });

  // Exposed for the tests.
  window.parseAngle = parseAngle;
})();
