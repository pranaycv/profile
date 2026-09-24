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
    var cssSize = canvas.clientWidth || Number(canvas.getAttribute("data-size")) || 240;
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

  var printCanvas = document.getElementById("qr-print");
  function paintPrint() {
    paint(printCanvas);
  }
  document.querySelectorAll("[data-print]").forEach(function (button) {
    button.addEventListener("click", function () {
      paintPrint();
      window.print();
    });
  });
  window.addEventListener("beforeprint", paintPrint);

  showUrl();
  paintCardIfVisible();
  window.addEventListener("resize", paintCardIfVisible);
  if (location.hash === "#qr") openQr();
})();
