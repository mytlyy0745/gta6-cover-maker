/* Vice City Cover Maker — cover renderer.
   Draws the multi-panel poster (hero + two lower panels + kicker band),
   the sunset/neon grade and the display lettering onto any canvas.
   Fonts: Bebas Neue for the big caption, Russo One for the rest. */

(function (global) {
  "use strict";

  var EXPORT_SIZES = {
    "1080x1080": [1080, 1080],
    "1080x1350": [1080, 1350],
    "1920x1080": [1920, 1080]
  };

  var GRADES = {
    sunset: { top: "rgba(255,122,47,0.34)", mid: "rgba(255,46,136,0.22)", bottom: "rgba(80,10,90,0.42)", mode: "overlay" },
    neon: { top: "rgba(34,211,238,0.30)", mid: "rgba(255,46,136,0.30)", bottom: "rgba(20,8,60,0.45)", mode: "soft-light" },
    palm: { top: "rgba(255,201,60,0.26)", mid: "rgba(20,120,110,0.24)", bottom: "rgba(10,30,40,0.48)", mode: "overlay" },
    vice: { top: "rgba(255,46,136,0.36)", mid: "rgba(124,58,237,0.22)", bottom: "rgba(34,211,238,0.30)", mode: "soft-light" }
  };

  function makeDefaultState() {
    function panel() { return { image: null, zoom: 1.15, ox: 0, oy: 0 }; }
    return {
      size: "1080x1080",
      caption: "VICE CITY NIGHTS",
      tagline: "Chasing the last light down the boulevard",
      kicker: "EST. 2026 · SUNSET EDITION",
      grade: "sunset",
      gradeStrength: 0.7,
      selectedPanel: "hero",
      panels: { hero: panel(), left: panel(), right: panel() }
    };
  }

  function sizeOf(state) {
    return EXPORT_SIZES[state.size] || EXPORT_SIZES["1080x1080"];
  }

  /* Panel geometry for a canvas of W x H. The hero takes the top,
     two panels share the middle band, the kicker band closes the poster. */
  function panelRects(W, H) {
    var gap = Math.round(W * 0.016);
    var heroH = Math.round(H * 0.56);
    var bandY = heroH + gap;
    var bandH = Math.round(H * 0.28);
    var half = Math.round((W - gap) / 2);
    return {
      hero: { x: 0, y: 0, w: W, h: heroH },
      left: { x: 0, y: bandY, w: half, h: bandH },
      right: { x: half + gap, y: bandY, w: W - half - gap, h: bandH },
      band: { x: 0, y: bandY + bandH + gap, w: W, h: H - bandY - bandH - gap }
    };
  }

  function drawPhotoCover(ctx, image, rect, zoom, ox, oy) {
    if (!image || !image.naturalWidth) {
      var g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
      g.addColorStop(0, "#3b1155");
      g.addColorStop(1, "#12081c");
      ctx.fillStyle = g;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      return;
    }
    var iw = image.naturalWidth, ih = image.naturalHeight;
    var scale = Math.max(rect.w / iw, rect.h / ih) * zoom;
    var dw = iw * scale, dh = ih * scale;
    var dx = rect.x + (rect.w - dw) / 2 + (ox / 100) * rect.w * 0.35;
    var dy = rect.y + (rect.h - dh) / 2 + (oy / 100) * rect.h * 0.35;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    ctx.drawImage(image, dx, dy, dw, dh);
    ctx.restore();
  }

  function applyGrade(ctx, W, H, gradeName, strength) {
    var preset = GRADES[gradeName] || GRADES.sunset;
    var g = ctx.createLinearGradient(0, 0, W * 0.25, H);
    g.addColorStop(0, preset.top);
    g.addColorStop(0.55, preset.mid);
    g.addColorStop(1, preset.bottom);
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, strength));
    ctx.globalCompositeOperation = preset.mode;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    /* Warm sun glow in the hero's upper corner, scaled by strength. */
    var glow = ctx.createRadialGradient(W * 0.78, H * 0.1, 0, W * 0.78, H * 0.1, W * 0.42);
    glow.addColorStop(0, "rgba(255,201,60," + (0.5 * strength).toFixed(3) + ")");
    glow.addColorStop(1, "rgba(255,201,60,0)");
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function fitCaptionFont(ctx, text, maxWidth, startPx, family) {
    var px = startPx;
    ctx.font = px + "px " + family;
    while (px > 24 && ctx.measureText(text).width > maxWidth) {
      px -= 6;
      ctx.font = px + "px " + family;
    }
    return px;
  }

  function drawLettering(ctx, W, H, rects, state) {
    var hero = rects.hero;
    var caption = (state.caption || "VICE CITY").toUpperCase();
    var pad = Math.round(W * 0.045);
    /* The tagline ribbon lives fully inside the hero panel, below the
       caption, so the hero's frame line never strikes through its text. */
    var tag = state.tagline || "";
    var tagPx = tag ? Math.max(16, Math.round(W * 0.026)) : 0;
    var ribbonH = tag ? tagPx * 2.1 : 0;
    var ribbonY = hero.y + hero.h - ribbonH - Math.round(H * 0.015);
    var capPx = fitCaptionFont(ctx, caption, W - pad * 2, Math.round(W * 0.21), '"Bebas Neue", sans-serif');
    var capY = ribbonY - Math.round(H * 0.015);
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = capPx + "px \"Bebas Neue\", sans-serif";
    ctx.shadowColor = "rgba(255,46,136,0.85)";
    ctx.shadowBlur = Math.round(W * 0.02);
    ctx.shadowOffsetY = Math.round(W * 0.006);
    ctx.lineWidth = Math.max(2, Math.round(capPx * 0.045));
    ctx.strokeStyle = "rgba(20,4,24,0.9)";
    ctx.strokeText(caption, pad, capY);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    var grad = ctx.createLinearGradient(0, capY - capPx, 0, capY);
    grad.addColorStop(0, "#fff7e8");
    grad.addColorStop(0.55, "#ffd9a0");
    grad.addColorStop(1, "#ff7a2f");
    ctx.fillStyle = grad;
    ctx.fillText(caption, pad, capY);
    ctx.restore();

    /* Tagline: a dark ribbon tucked under the caption, Russo One. */
    if (tag) {
      ctx.save();
      ctx.font = tagPx + "px \"Russo One\", sans-serif";
      var tw = ctx.measureText(tag).width;
      var ribbonW = Math.min(W - pad * 2, tw + pad);
      ctx.fillStyle = "rgba(12,4,18,0.82)";
      ctx.fillRect(pad, ribbonY, ribbonW, ribbonH);
      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(pad, ribbonY, Math.round(W * 0.008), ribbonH);
      ctx.fillStyle = "#f6ead8";
      ctx.textBaseline = "middle";
      ctx.fillText(tag, pad + Math.round(W * 0.02), ribbonY + ribbonH / 2);
      ctx.restore();
    }

    /* Kicker band: small caps strip across the bottom of the poster. */
    var band = rects.band;
    ctx.save();
    ctx.fillStyle = "#160a20";
    ctx.fillRect(band.x, band.y, band.w, band.h);
    ctx.fillStyle = "#ffc93c";
    ctx.fillRect(band.x, band.y, band.w, Math.max(2, Math.round(H * 0.004)));
    var kickPx = Math.max(15, Math.round(W * 0.024));
    ctx.font = kickPx + "px \"Russo One\", sans-serif";
    ctx.fillStyle = "#f6ead8";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(state.kicker || "", pad, band.y + band.h / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#ff2e88";
    ctx.fillText("VICE CITY COVER MAKER", W - pad, band.y + band.h / 2);
    ctx.restore();
  }

  function drawFrame(ctx, W, H, rects) {
    var gap = Math.round(W * 0.016);
    ctx.save();
    ctx.strokeStyle = "rgba(246,234,216,0.85)";
    ctx.lineWidth = Math.max(2, gap * 0.5);
    Object.keys(rects).forEach(function (key) {
      if (key === "band") return;
      var r = rects[key];
      ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
    });
    ctx.strokeStyle = "#ff2e88";
    ctx.lineWidth = Math.max(3, Math.round(W * 0.006));
    ctx.strokeRect(2, 2, W - 4, H - 4);
    ctx.restore();
  }

  function drawCover(canvas, state) {
    var dims = sizeOf(state);
    var W = dims[0], H = dims[1];
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#12081c";
    ctx.fillRect(0, 0, W, H);
    var rects = panelRects(W, H);
    ["hero", "left", "right"].forEach(function (key) {
      var p = state.panels[key];
      drawPhotoCover(ctx, p.image, rects[key], p.zoom, p.ox, p.oy);
    });
    applyGrade(ctx, W, H, state.grade, state.gradeStrength);
    drawLettering(ctx, W, H, rects, state);
    drawFrame(ctx, W, H, rects);
  }

  global.ViceCover = {
    EXPORT_SIZES: EXPORT_SIZES,
    GRADES: GRADES,
    makeDefaultState: makeDefaultState,
    panelRects: panelRects,
    drawCover: drawCover,
    sizeOf: sizeOf
  };
})(typeof window !== "undefined" ? window : globalThis);
