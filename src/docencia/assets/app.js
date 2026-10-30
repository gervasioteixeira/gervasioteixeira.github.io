/* Tecnologias da Informação na Prática Docente · comportamento da página (sem cookies, sem rede). */
(function () {
  "use strict";
  var KEY = "docencia2026.";
  function store(op, k, v) {
    try {
      if (op === "get") return localStorage.getItem(KEY + k);
      if (op === "set") localStorage.setItem(KEY + k, v);
    } catch (e) {}
    return null;
  }

  // Navegação: realça a seção visível
  var links = [].slice.call(document.querySelectorAll("#menu a"));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(function (s) { io.observe(s); });
  }

  // Botões de copiar
  function copyText(txt, btn) {
    function ok() {
      var old = btn.textContent;
      btn.textContent = "Copiado";
      btn.classList.add("ok");
      setTimeout(function () { btn.textContent = old; btn.classList.remove("ok"); }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(ok, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) {}
      document.body.removeChild(ta);
    }
  }
  [].forEach.call(document.querySelectorAll("[data-copy]"), function (b) {
    b.addEventListener("click", function () {
      var el = document.querySelector(b.getAttribute("data-copy"));
      if (el) copyText(el.innerText.trim(), b);
    });
  });

  // Campos com memória local
  [].forEach.call(document.querySelectorAll("[data-save]"), function (el) {
    var id = el.getAttribute("data-save");
    var saved = store("get", id);
    if (saved !== null) {
      if (el.type === "checkbox") { el.checked = saved === "1"; } else { el.value = saved; }
    }
    if (el.type === "checkbox" && el.closest("li")) { el.closest("li").classList.toggle("done", el.checked); }
    el.addEventListener("input", function () {
      store("set", id, el.type === "checkbox" ? (el.checked ? "1" : "0") : el.value);
      if (el.type === "checkbox" && el.closest("li")) { el.closest("li").classList.toggle("done", el.checked); }
    });
  });
  [].forEach.call(document.querySelectorAll(".steps li"), function (li) {
    li.addEventListener("click", function (e) {
      if (e.target.tagName === "A" || e.target.tagName === "INPUT") return;
      var cb = li.querySelector("input[type=checkbox]");
      if (cb) { cb.checked = !cb.checked; cb.dispatchEvent(new Event("input")); }
    });
  });

  // Copiar fichas preenchidas (rótulo: valor)
  [].forEach.call(document.querySelectorAll("[data-copyform]"), function (btn) {
    btn.addEventListener("click", function () {
      var box = document.querySelector(btn.getAttribute("data-copyform"));
      if (!box) return;
      var out = [];
      [].forEach.call(box.querySelectorAll("input[type=text],textarea"), function (el) {
        var lab = box.querySelector('label[for="' + el.id + '"]');
        out.push((lab ? lab.textContent : el.id) + ": " + (el.value || ""));
      });
      copyText(out.join("\n"), btn);
    });
  });

  // Prompts preenchíveis: cada [campo] do modelo vira um campo de texto e o prompt se monta sozinho
  [].forEach.call(document.querySelectorAll(".prompt[data-fill]"), function (card) {
    var pre = card.querySelector("pre");
    if (!pre) return;
    var tpl = pre.textContent.trim();
    var tokens = [];
    (tpl.match(/\[[^\]]+\]/g) || []).forEach(function (tk) { if (tokens.indexOf(tk) < 0) tokens.push(tk); });
    if (!tokens.length) return;
    var box = document.createElement("div");
    box.className = "fields";
    var inputs = tokens.map(function (tk, i) {
      var raw = tk.slice(1, -1);
      var label = raw.charAt(0).toUpperCase() + raw.slice(1);
      var id = card.id + "-f" + i;
      var wrap = document.createElement("div"); wrap.className = "fld";
      var lb = document.createElement("label"); lb.className = "f"; lb.setAttribute("for", id); lb.textContent = label;
      var inp = document.createElement("input"); inp.type = "text"; inp.id = id; inp.placeholder = raw; inp.autocomplete = "off";
      var sv = store("get", id); if (sv !== null) inp.value = sv;
      wrap.appendChild(lb); wrap.appendChild(inp); box.appendChild(wrap);
      return inp;
    });
    var clr = document.createElement("button");
    clr.type = "button"; clr.className = "btn sm clear"; clr.textContent = "Limpar campos";
    box.appendChild(clr);
    card.insertBefore(box, pre);
    pre.classList.add("live");
    function render() {
      var out = tpl;
      tokens.forEach(function (tk, i) {
        var v = inputs[i].value.trim();
        out = out.split(tk).join(v || tk);
        store("set", inputs[i].id, inputs[i].value);
      });
      pre.textContent = out;
    }
    inputs.forEach(function (inp) { inp.addEventListener("input", render); });
    clr.addEventListener("click", function () { inputs.forEach(function (i) { i.value = ""; }); render(); });
    render();
  });

  // Declaração de uso de IA: montada a partir dos campos
  var decOut = document.getElementById("decOut");
  if (decOut) {
    var dv = function (id) { var e = document.getElementById(id); return (e && e.value.trim()) || "________"; };
    var decText = function () {
      var conf = document.getElementById("d8");
      var l = [
        "DECLARAÇÃO DE USO DE INTELIGÊNCIA ARTIFICIAL", "",
        "Título: " + dv("d1"),
        "Autor(es): " + dv("d2"),
        "Data: " + dv("d3"),
        "Ferramenta(s): " + dv("d4"),
        "Finalidade do uso: " + dv("d5"),
        "O que foi conferido por mim: " + dv("d6"),
        "Não utilizei IA para: " + dv("d7")
      ];
      if (conf && conf.checked) { l.push("", "Declaro que todas as informações e referências foram conferidas nas fontes originais e que respondo integralmente pelo conteúdo."); }
      return l.join("\n");
    };
    var decRender = function () { decOut.textContent = decText(); };
    [].forEach.call(document.querySelectorAll("#declForm input,#declForm textarea"), function (el) { el.addEventListener("input", decRender); });
    decRender();
    var dl = document.getElementById("decDl");
    if (dl) dl.addEventListener("click", function () {
      var blob = new Blob([decText()], { type: "text/plain;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "declaracao-de-uso-de-ia.txt";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
    var pr = document.getElementById("decPrint");
    if (pr) pr.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
      document.body.appendChild(f);
      var d = f.contentWindow.document;
      d.open();
      d.write("<!doctype html><meta charset='utf-8'><title>Declaração de uso de IA</title><body style='font:16px/1.7 Georgia,serif;margin:40px;white-space:pre-wrap'></body>");
      d.close();
      d.body.textContent = decText();
      f.contentWindow.focus(); f.contentWindow.print();
      setTimeout(function () { document.body.removeChild(f); }, 2000);
    });
  }

  // Botão de voltar ao topo
  var up = document.getElementById("totop");
  if (up) {
    window.addEventListener("scroll", function () { up.classList.toggle("show", window.scrollY > 900); }, { passive: true });
    up.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }
})();
