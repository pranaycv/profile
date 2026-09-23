(function () {
  var PUBLIC_URL = "https://pranaycv.github.io/profile/";

  function pageUrl() {
    if (location.hostname === "pranaycv.github.io") {
      var url = new URL(location.href);
      url.hash = "";
      return url.toString();
    }
    return PUBLIC_URL;
  }

  function paintQr(canvas, text) {
    var qr = qrcodegen.QrCode.encodeText(text, qrcodegen.QrCode.Ecc.MEDIUM);
    var count = qr.size;
    var border = 2;
    var cssSize = canvas.clientWidth || 240;
    var dpr = window.devicePixelRatio || 1;
    var dim = Math.round(cssSize * dpr);
    canvas.width = dim;
    canvas.height = dim;
    var ctx = canvas.getContext("2d");
    var scale = dim / (count + border * 2);
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, dim, dim);
    ctx.fillStyle = "#1b1914";
    for (var y = 0; y < count; y++) {
      for (var x = 0; x < count; x++) {
        if (qr.getModule(x, y)) {
          ctx.fillRect(
            (x + border) * scale,
            (y + border) * scale,
            Math.ceil(scale),
            Math.ceil(scale)
          );
        }
      }
    }
  }

  function paint(canvas) {
    if (!canvas) return;
    paintQr(canvas, pageUrl());
  }

  var card = document.getElementById("qr-card");
  var dialog = document.getElementById("qr-dialog");
  var sheet = document.getElementById("qr-sheet");
  var linkOut = document.getElementById("share-url");
  var copyBtn = document.getElementById("copy-link");
  var copyStatus = document.getElementById("copy-status");

  function showUrl() {
    var url = pageUrl();
    if (linkOut) linkOut.textContent = url.replace(/^https:\/\//, "");
    return url;
  }

  function openQr() {
    showUrl();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    requestAnimationFrame(function () {
      paint(sheet);
    });
  }

  function closeQr() {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  document.querySelectorAll("[data-open-qr]").forEach(function (button) {
    button.addEventListener("click", openQr);
  });

  dialog.querySelectorAll("[data-close-qr]").forEach(function (button) {
    button.addEventListener("click", closeQr);
  });

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) closeQr();
  });

  dialog.addEventListener("cancel", function (event) {
    event.preventDefault();
    closeQr();
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var url = pageUrl();
      var done = function () {
        copyStatus.textContent = "Link copied";
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(done);
      } else {
        done();
      }
    });
  }

  function paintCardIfVisible() {
    if (!card) return;
    if (card.offsetParent === null) return;
    paint(card);
  }

  showUrl();
  paintCardIfVisible();
  window.addEventListener("resize", paintCardIfVisible);
  if (location.hash === "#qr") openQr();
})();
