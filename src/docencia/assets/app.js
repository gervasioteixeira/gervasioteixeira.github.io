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

  // Copiar a ficha do minicurso como texto
  var fichaBtn = document.getElementById("copiarFicha");
  if (fichaBtn) {
    fichaBtn.addEventListener("click", function () {
      var out = [];
      [].forEach.call(document.querySelectorAll("#ficha [data-save]"), function (el) {
        var lab = document.querySelector('label[for="' + el.id + '"]');
        out.push((lab ? lab.textContent : el.id) + ": " + (el.value || ""));
      });
      copyText(out.join("\n"), fichaBtn);
    });
  }

  // Botão de voltar ao topo
  var up = document.getElementById("totop");
  if (up) {
    window.addEventListener("scroll", function () { up.classList.toggle("show", window.scrollY > 900); }, { passive: true });
    up.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }
})();
