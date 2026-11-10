/* ============================================================
   EcoMix — Visor 3D das caixas de coleta
   Caixa 3D (CSS) com a arte real das 4 faces, em 3 cores.
   Assets: assets/caixas3d/<cor>/<caixa>-<face>.png
   Uso:  EcoMixBox3D.mount("#id", { box:"c2", color:"verde",
            assets:"assets/caixas3d", tabs:true, colors:true });
   ============================================================ */
(function (global) {
  "use strict";

  var BOXES = {
    c1: { nome: "Recicláveis especiais" },
    c2: { nome: "Lixo reciclável" },
    c3: { nome: "Pequena (100 L)" }
  };
  var COLORS = {
    verde:   { nome: "Verde",   sw: "#0B5040" },
    azul:    { nome: "Azul",    sw: "#0D3B66" },
    grafite: { nome: "Grafite", sw: "#2B3035" }
  };
  var FACES = [
    { k: "front", lbl: "Frente" },
    { k: "right", lbl: "Lateral" },
    { k: "back",  lbl: "Verso"  },
    { k: "left",  lbl: "Lateral" }
  ];
  var FACE_Y = { front: -20, right: -110, back: -200, left: 70 };

  var reduceMotion = global.matchMedia &&
    global.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function build(container, opts) {
    var assets = (opts.assets || "assets/caixas3d").replace(/\/$/, "");
    var showTabs = opts.tabs !== false;
    var showColors = opts.colors !== false;
    var current = opts.box || "c2";
    var color = opts.color || "verde";

    container.classList.add("box3d-component");
    container.innerHTML = "";

    // seletor de caixa
    var tabsWrap = null;
    if (showTabs) {
      tabsWrap = el("div", "box-tabs");
      tabsWrap.setAttribute("role", "tablist");
      tabsWrap.setAttribute("aria-label", "Escolher caixa");
      Object.keys(BOXES).forEach(function (key) {
        var b = el("button", "box-tab", BOXES[key].nome);
        b.type = "button"; b.setAttribute("role", "tab");
        b.setAttribute("data-box", key);
        b.setAttribute("aria-selected", key === current ? "true" : "false");
        tabsWrap.appendChild(b);
      });
      container.appendChild(tabsWrap);
    }

    var stage = el("div", "box3d-stage");
    stage.setAttribute("aria-label", "Caixa de coleta em 3D. Arraste para girar.");
    var box = el("div", "box3d");

    var faceImgs = {};
    ["front", "back", "right", "left"].forEach(function (f) {
      var face = el("div", "box3d__face box3d__" + f);
      var img = el("img"); img.alt = "Face " + f + " da caixa"; img.loading = "lazy";
      face.appendChild(img); faceImgs[f] = img; box.appendChild(face);
    });
    box.appendChild(el("div", "box3d__face box3d__top",
      '<div class="box3d__lid"><span class="ec">EcoMix</span><small>Gestão ambiental</small></div>'));
    box.appendChild(el("div", "box3d__face box3d__bottom"));

    stage.appendChild(box);
    container.appendChild(stage);
    container.appendChild(el("div", "box3d-floor"));

    // seletor de cor
    var colorWrap = null;
    if (showColors) {
      colorWrap = el("div", "box3d-colors");
      colorWrap.setAttribute("aria-label", "Cor da caixa");
      Object.keys(COLORS).forEach(function (ck) {
        var b = el("button", "box3d-sw");
        b.type = "button";
        b.title = COLORS[ck].nome;
        b.setAttribute("data-color", ck);
        b.setAttribute("aria-label", "Cor " + COLORS[ck].nome);
        b.setAttribute("aria-pressed", ck === color ? "true" : "false");
        b.innerHTML = '<i style="background:' + COLORS[ck].sw + '"></i>' + COLORS[ck].nome;
        colorWrap.appendChild(b);
      });
      container.appendChild(colorWrap);
    }

    // controles por face
    var controls = el("div", "box3d-controls");
    FACES.forEach(function (f, i) {
      var b = el("button", null, f.lbl);
      b.type = "button"; b.setAttribute("data-face", f.k);
      if (i === 0) b.setAttribute("aria-pressed", "true");
      controls.appendChild(b);
    });
    container.appendChild(controls);
    container.appendChild(el("p", "box3d-hint", "Arraste para girar · troque a cor e veja cada face"));

    // estado
    var rotY = FACE_Y.front, rotX = -10;
    var dragging = false, sx = 0, sy = 0, sRotY = 0, sRotX = 0, moved = false;
    var autoReq = null, idle = null;

    function apply() { box.style.transform = "rotateX(" + rotX + "deg) rotateY(" + rotY + "deg)"; }
    function setFacePressed(k) {
      controls.querySelectorAll("button").forEach(function (btn) {
        btn.setAttribute("aria-pressed", btn.getAttribute("data-face") === k ? "true" : "false");
      });
    }
    function goFace(k) {
      stopAuto();
      var diff = ((FACE_Y[k] - rotY + 540) % 360) - 180;
      rotY += diff; rotX = -10; apply(); setFacePressed(k);
    }
    function loadBox(key) {
      current = key;
      ["front", "back", "right", "left"].forEach(function (f) {
        faceImgs[f].src = assets + "/" + color + "/" + key + "-" + f + ".png";
      });
      if (tabsWrap) tabsWrap.querySelectorAll(".box-tab").forEach(function (t) {
        t.setAttribute("aria-selected", t.getAttribute("data-box") === key ? "true" : "false");
      });
    }
    function setColor(ck) {
      color = ck; loadBox(current);
      if (colorWrap) colorWrap.querySelectorAll(".box3d-sw").forEach(function (s) {
        s.setAttribute("aria-pressed", s.getAttribute("data-color") === ck ? "true" : "false");
      });
    }

    function autoSpin() { rotY += 0.22; apply(); autoReq = requestAnimationFrame(autoSpin); }
    function startAuto() { if (reduceMotion || autoReq) return; autoReq = requestAnimationFrame(autoSpin); }
    function stopAuto() { if (autoReq) { cancelAnimationFrame(autoReq); autoReq = null; } if (idle) { clearTimeout(idle); idle = null; } }
    function scheduleAuto() { if (reduceMotion) return; if (idle) clearTimeout(idle); idle = setTimeout(startAuto, 3500); }

    function down(e) {
      dragging = true; moved = false; box.classList.add("dragging"); stopAuto();
      var p = e.touches ? e.touches[0] : e; sx = p.clientX; sy = p.clientY; sRotY = rotY; sRotX = rotX;
    }
    function move(e) {
      if (!dragging) return;
      var p = e.touches ? e.touches[0] : e, dx = p.clientX - sx, dy = p.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      rotY = sRotY + dx * 0.4; rotX = Math.max(-40, Math.min(35, sRotX - dy * 0.3)); apply();
      if (e.cancelable && Math.abs(dx) > Math.abs(dy)) e.preventDefault();
    }
    function up() { if (!dragging) return; dragging = false; box.classList.remove("dragging"); scheduleAuto(); }

    stage.addEventListener("mousedown", down);
    global.addEventListener("mousemove", move);
    global.addEventListener("mouseup", up);
    stage.addEventListener("touchstart", down, { passive: true });
    stage.addEventListener("touchmove", move, { passive: false });
    stage.addEventListener("touchend", up);

    controls.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-face]"); if (b) goFace(b.getAttribute("data-face"));
    });
    if (colorWrap) colorWrap.addEventListener("click", function (e) {
      var b = e.target.closest(".box3d-sw"); if (b) setColor(b.getAttribute("data-color"));
    });
    if (tabsWrap) tabsWrap.addEventListener("click", function (e) {
      var b = e.target.closest(".box-tab"); if (b) { loadBox(b.getAttribute("data-box")); goFace("front"); }
    });

    loadBox(current); apply(); scheduleAuto();

    if ("IntersectionObserver" in global) {
      new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (!en.isIntersecting) stopAuto(); else if (!dragging) scheduleAuto();
        });
      }, { threshold: 0.2 }).observe(container);
    }

    return { load: loadBox, face: goFace, color: setColor };
  }

  var API = {
    mount: function (sel, opts) {
      var node = typeof sel === "string" ? document.querySelector(sel) : sel;
      if (!node) return null;
      return build(node, opts || {});
    },
    auto: function () {
      document.querySelectorAll("[data-box3d]").forEach(function (n) {
        build(n, {
          box: n.getAttribute("data-box") || "c2",
          color: n.getAttribute("data-color") || "verde",
          assets: n.getAttribute("data-assets") || "assets/caixas3d",
          tabs: n.getAttribute("data-tabs") !== "false",
          colors: n.getAttribute("data-colors") !== "false"
        });
      });
    }
  };

  global.EcoMixBox3D = API;
  if (document.readyState !== "loading") API.auto();
  else document.addEventListener("DOMContentLoaded", API.auto);
})(window);
