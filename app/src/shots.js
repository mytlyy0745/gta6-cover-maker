/* Vice City Cover Maker — export helpers.
   Renders the current state to a fresh offscreen canvas at the chosen
   post size and hands back a PNG blob ready to download. */

(function (global) {
  "use strict";

  function filenameFor(size) {
    return "vice-cover-" + size + ".png";
  }

  function buildExportCanvas(state, size) {
    var next = Object.assign({}, state, { size: size || state.size });
    var canvas = document.createElement("canvas");
    global.ViceCover.drawCover(canvas, next);
    return canvas;
  }

  function exportCoverBlob(state, size) {
    return new Promise(function (resolve, reject) {
      var canvas = buildExportCanvas(state, size);
      if (canvas.toBlob) {
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob);
          else reject(new Error("Export produced no PNG blob"));
        }, "image/png");
      } else {
        reject(new Error("This browser cannot export a PNG blob"));
      }
    });
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  function exportAndDownload(state, size) {
    return exportCoverBlob(state, size).then(function (blob) {
      downloadBlob(blob, filenameFor(size));
      return { size: size, bytes: blob.size, filename: filenameFor(size) };
    });
  }

  global.ViceShots = {
    filenameFor: filenameFor,
    buildExportCanvas: buildExportCanvas,
    exportCoverBlob: exportCoverBlob,
    downloadBlob: downloadBlob,
    exportAndDownload: exportAndDownload
  };
})(typeof window !== "undefined" ? window : globalThis);
