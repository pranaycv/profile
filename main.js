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

  function isFinderModule(x, y, size) {
    function inFinder(ox, oy) {
      return x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    }
    return inFinder(0, 0) || inFinder(size - 7, 0) || inFinder(0, size - 7);
  }

  function paintQr(canvas, text) {
    if (!canvas || typeof qrcodegen === "undefined") return;
    var qr = qrcodegen.QrCode.encodeText(text, qrcodegen.QrCode.Ecc.HIGH);
    var count = qr.size;
    var border = 3;
    var cssSize =
      canvas.clientWidth ||
      Number(canvas.getAttribute("data-size")) ||
      240;
    var dpr = window.devicePixelRatio || 1;
    var dim = Math.max(1, Math.round(cssSize * dpr));
    canvas.width = dim;
    canvas.height = dim;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var scale = dim / (count + border * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, dim, dim);
    ctx.fillStyle = "#142033";

    for (var y = 0; y < count; y++) {
      for (var x = 0; x < count; x++) {
        if (!qr.getModule(x, y)) continue;
        var px = (x + border) * scale;
        var py = (y + border) * scale;
        if (isFinderModule(x, y, count)) {
          var inset = scale * 0.08;
          var r = Math.max(1, scale * 0.22);
          var s = Math.max(1, scale - inset * 2);
          roundedRect(ctx, px + inset, py + inset, s, s, r);
          ctx.fill();
        } else {
          var radius = scale * 0.38;
          ctx.beginPath();
          ctx.arc(px + scale / 2, py + scale / 2, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  function roundedRect(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
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
  var printCanvas = document.getElementById("qr-print");
  var printCard = document.querySelector(".print-card");

  function showUrl() {
    var url = pageUrl();
    if (linkOut) linkOut.textContent = url.replace(/^https:\/\//, "");
    return url;
  }

  function openQr() {
    showUrl();
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    requestAnimationFrame(function () {
      paint(sheet);
    });
  }

  function closeQr() {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  document.querySelectorAll("[data-open-qr]").forEach(function (button) {
    button.addEventListener("click", openQr);
  });

  if (dialog) {
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
  }

  function copyLink(button) {
    var url = pageUrl();
    var done = function () {
      if (copyStatus) copyStatus.textContent = "Link copied";
      if (button && button !== copyBtn) {
        var original = button.textContent;
        button.textContent = "Copied";
        setTimeout(function () {
          button.textContent = original;
        }, 1600);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(done);
    } else {
      done();
    }
  }

  function sharePage(button) {
    var url = pageUrl();
    var summary = "Pranay Soni — Senior Computer Vision, Machine Learning & AI Engineer";
    var ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    var data = ios
      ? { title: "Pranay Soni", text: summary + "\n" + url }
      : { title: "Pranay Soni", text: summary, url: url };

    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      navigator.share(data).catch(function (err) {
        if (err && err.name === "AbortError") return;
        copyLink(button);
      });
      return;
    }
    copyLink(button);
  }

  document.querySelectorAll("[data-share]").forEach(function (button) {
    button.addEventListener("click", function () {
      sharePage(button);
    });
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      copyLink(copyBtn);
    });
  }

  function paintCardIfVisible() {
    if (!card) return;
    if (card.offsetParent === null) return;
    paint(card);
  }

  function paintPrint() {
    if (!printCanvas) return;
    // Briefly lay out the print card so the canvas has a real size if needed.
    if (printCard) {
      printCard.style.position = "fixed";
      printCard.style.left = "-10000px";
      printCard.style.top = "0";
      printCard.style.display = "block";
      printCard.style.visibility = "hidden";
    }
    try {
      paint(printCanvas);
    } finally {
      if (printCard) {
        printCard.style.position = "";
        printCard.style.left = "";
        printCard.style.top = "";
        printCard.style.display = "";
        printCard.style.visibility = "";
      }
    }
  }

  function printCardNow() {
    try {
      paintPrint();
    } catch (err) {
      // Still open the print dialog even if QR paint fails.
    }
    window.print();
  }

  document.querySelectorAll("[data-print]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      printCardNow();
    });
  });
  window.addEventListener("beforeprint", function () {
    try {
      paintPrint();
    } catch (err) {}
  });

  showUrl();
  paintCardIfVisible();
  window.addEventListener("resize", paintCardIfVisible);
  if (location.hash === "#qr") openQr();
})();
