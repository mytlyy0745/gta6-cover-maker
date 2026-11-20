/* Vice City Cover Maker — editor wiring.
   Photo picking (file / drag-and-drop / samples), per-panel crop sliders,
   caption + grade controls, live preview and PNG export. */

(function () {
  "use strict";

  var state = window.ViceCover.makeDefaultState();
  var stage = document.getElementById("stage");
  var statusLine = document.getElementById("statusLine");
  var sizeLabel = document.getElementById("sizeLabel");
  var dropHint = document.getElementById("dropHint");

  function setStatus(text) { statusLine.textContent = text; }

  function render() {
    var dims = window.ViceCover.sizeOf(state);
    sizeLabel.textContent = "Preview: " + dims[0] + " × " + dims[1];
    window.ViceCover.drawCover(stage, state);
  }

  function loadImageFromUrl(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error("Could not load " + url)); };
      img.src = url;
    });
  }

  function assignPhoto(img, panelKey, announce) {
    state.panels[panelKey].image = img;
    state.panels[panelKey].zoom = 1.15;
    state.panels[panelKey].ox = 0;
    state.panels[panelKey].oy = 0;
    syncSliders();
    render();
    if (announce) setStatus(announce);
  }

  function assignToSelected(img, announce) {
    assignPhoto(img, state.selectedPanel, announce);
  }

  function fileToImage(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        loadImageFromUrl(reader.result).then(resolve, reject);
      };
      reader.onerror = function () { reject(new Error("Could not read that file")); };
      reader.readAsDataURL(file);
    });
  }

  function syncSliders() {
    var p = state.panels[state.selectedPanel];
    document.getElementById("zoomSlider").value = p.zoom;
    document.getElementById("zoomOut").textContent = p.zoom.toFixed(2) + "×";
    document.getElementById("panXSlider").value = p.ox;
    document.getElementById("panXOut").textContent = String(p.ox);
    document.getElementById("panYSlider").value = p.oy;
    document.getElementById("panYOut").textContent = String(p.oy);
  }

  /* --- photo sources -------------------------------------------------- */

  var photoInput = document.getElementById("photoInput");
  photoInput.addEventListener("change", function () {
    var file = photoInput.files && photoInput.files[0];
    if (!file) return;
    setStatus("Loading your photo…");
    fileToImage(file).then(function (img) {
      assignToSelected(img, "Photo placed in the " + state.selectedPanel + " panel.");
    }).catch(function (err) { setStatus(err.message); });
    photoInput.value = "";
  });

  ["dragenter", "dragover"].forEach(function (evt) {
    document.addEventListener(evt, function (e) {
      e.preventDefault();
      dropHint.textContent = "Drop it — fills the " + state.selectedPanel + " panel";
    });
  });
  ["dragleave", "drop"].forEach(function (evt) {
    document.addEventListener(evt, function (e) {
      e.preventDefault();
      dropHint.textContent = "Drop a photo anywhere to fill the selected panel";
    });
  });
  document.addEventListener("drop", function (e) {
    var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file || file.type.indexOf("image/") !== 0) return;
    setStatus("Loading your photo…");
    fileToImage(file).then(function (img) {
      assignToSelected(img, "Photo placed in the " + state.selectedPanel + " panel.");
    }).catch(function (err) { setStatus(err.message); });
  });

  document.querySelectorAll(".sample-btn[data-sample]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var url = btn.getAttribute("data-sample");
      setStatus("Loading the sample photo…");
      loadImageFromUrl(url).then(function (img) {
        assignToSelected(img, "Sample photo placed in the " + state.selectedPanel + " panel.");
      }).catch(function (err) { setStatus(err.message); });
    });
  });

  document.getElementById("fillAllBtn").addEventListener("click", function () {
    var heroImg = state.panels.hero.image || state.panels.left.image || state.panels.right.image;
    if (!heroImg) { setStatus("Pick a photo first, then fill every panel with it."); return; }
    ["hero", "left", "right"].forEach(function (key) {
      state.panels[key].image = heroImg;
    });
    render();
    setStatus("One photo now fills all three panels.");
  });

  /* --- panel picker + crop sliders ------------------------------------- */

  document.querySelectorAll(".panel-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".panel-btn").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      state.selectedPanel = btn.getAttribute("data-panel");
      syncSliders();
      setStatus("Editing the " + state.selectedPanel + " panel — zoom and pan apply here.");
    });
  });

  function bindCrop(id, outId, apply, format) {
    var input = document.getElementById(id);
    var out = document.getElementById(outId);
    input.addEventListener("input", function () {
      var value = parseFloat(input.value);
      apply(value);
      out.textContent = format(value);
      render();
    });
  }
  bindCrop("zoomSlider", "zoomOut", function (v) { state.panels[state.selectedPanel].zoom = v; }, function (v) { return v.toFixed(2) + "×"; });
  bindCrop("panXSlider", "panXOut", function (v) { state.panels[state.selectedPanel].ox = v; }, function (v) { return String(Math.round(v)); });
  bindCrop("panYSlider", "panYOut", function (v) { state.panels[state.selectedPanel].oy = v; }, function (v) { return String(Math.round(v)); });

  /* --- words ------------------------------------------------------------ */

  function bindText(id, key) {
    var input = document.getElementById(id);
    input.addEventListener("input", function () {
      state[key] = input.value;
      render();
    });
  }
  bindText("captionInput", "caption");
  bindText("taglineInput", "tagline");
  bindText("kickerInput", "kicker");

  /* --- grade ------------------------------------------------------------ */

  document.querySelectorAll(".grade-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".grade-btn").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      state.grade = btn.getAttribute("data-grade");
      render();
      setStatus("Grade: " + btn.textContent + ".");
    });
  });

  var gradeSlider = document.getElementById("gradeSlider");
  gradeSlider.addEventListener("input", function () {
    state.gradeStrength = parseFloat(gradeSlider.value) / 100;
    document.getElementById("gradeOut").textContent = gradeSlider.value + "%";
    render();
  });

  /* --- export ----------------------------------------------------------- */

  document.getElementById("exportBtn").addEventListener("click", function () {
    var picked = document.querySelector('input[name="exportSize"]:checked');
    var size = picked ? picked.value : state.size;
    state.size = size;
    setStatus("Exporting " + size + "…");
    window.ViceShots.exportAndDownload(state, size).then(function (info) {
      render();
      setStatus("Saved " + info.filename + " (" + info.bytes + " bytes). Share it anywhere.");
    }).catch(function (err) { setStatus(err.message); });
  });

  document.querySelectorAll('input[name="exportSize"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      state.size = radio.value;
      render();
    });
  });

  /* --- boot: load display fonts, then the boulevard sample ------------- */

  function boot() {
    var fontsReady = Promise.resolve();
    if (document.fonts && document.fonts.load) {
      fontsReady = Promise.all([
        document.fonts.load('400 80px "Bebas Neue"'),
        document.fonts.load('400 24px "Russo One"')
      ]).catch(function () { return null; });
    }
    fontsReady.then(function () {
      render();
      return loadImageFromUrl("samples/boulevard.jpg");
    }).then(function (img) {
      assignPhoto(img, "hero", "Boulevard sample loaded — pick a panel, drop in your own photo.");
      return loadImageFromUrl("samples/pier.jpg");
    }).then(function (img) {
      state.panels.left.image = img;
      state.panels.right.image = img;
      render();
    }).catch(function (err) { setStatus(err.message); });
  }

  window.__viceCityState = state;
  syncSliders();
  boot();
})();
