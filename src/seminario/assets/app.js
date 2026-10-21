/* Página do minicurso "Escrever com IA sem deixar de pensar". JS puro, sem dependências, sem rastreamento. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var PFX = "sem26:";

  /* ---------- armazenamento (tolerante a falhas) ---------- */
  var store = {
    get: function (k) { try { return localStorage.getItem(PFX + k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(PFX + k, v); } catch (e) {} }
  };

  /* ---------- relógio (com simulação ?hora=HH:MM) ---------- */
  var EVENT_DAY = "2026-10-23";
  var TZ = "-03:00";
  var sim = null;
  (function () {
    var m = /[?&]hora=(\d{1,2}):(\d{2})/.exec(location.search);
    if (m) { var target = Date.parse(EVENT_DAY + "T" + ("0" + m[1]).slice(-2) + ":" + m[2] + ":00" + TZ); sim = target - Date.now(); }
  })();
  function now() { return new Date(Date.now() + (sim || 0)); }
  function at(hhmm) { return Date.parse(EVENT_DAY + "T" + hhmm + ":00" + TZ); }
  function fmt(ms) {
    var s = Math.max(0, Math.round(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return h ? h + ":" + p(m) + ":" + p(x) : p(m) + ":" + p(x);
  }

  /* ---------- salvar campos ---------- */
  function initSave() {
    $$("[data-save]").forEach(function (el) {
      var k = el.getAttribute("data-save"), v = store.get(k);
      if (v !== null) { if (el.type === "checkbox") el.checked = v === "1"; else el.value = v; }
      var h = function () { store.set(k, el.type === "checkbox" ? (el.checked ? "1" : "0") : el.value); flashSaved(el); };
      el.addEventListener(el.type === "checkbox" ? "change" : "input", h);
    });
  }
  function flashSaved(el) {
    var a = el.closest(".act"); var s = a && $(".saved", a);
    if (s) { s.classList.add("show"); clearTimeout(s._t); s._t = setTimeout(function () { s.classList.remove("show"); }, 1200); }
  }

  /* ---------- copiar ---------- */
  function copyText(txt) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(txt);
    return new Promise(function (res, rej) {
      var t = document.createElement("textarea"); t.value = txt; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select();
      try { document.execCommand("copy") ? res() : rej(); } catch (e) { rej(e); } document.body.removeChild(t);
    });
  }
  function okBtn(b, txt) { var o = b.getAttribute("data-label") || b.textContent; b.setAttribute("data-label", o); b.textContent = txt || "Copiado ✓"; b.classList.add("ok"); setTimeout(function () { b.textContent = o; b.classList.remove("ok"); }, 1500); }
  function initCopy() {
    $$("button.copy[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = $(b.getAttribute("data-copy")); var txt = t.value !== undefined && t.tagName !== "PRE" && t.tagName !== "DIV" ? t.value : t.innerText;
        copyText(txt.trim()).then(function () { okBtn(b); }, function () { okBtn(b, "Selecione e copie"); });
      });
    });
    $$("button.copy-act").forEach(function (b) {
      b.addEventListener("click", function () {
        var ids = b.getAttribute("data-fields").split(","), labels = b.getAttribute("data-labels").split("|");
        var txt = ids.map(function (id, i) { return labels[i] + ":\n" + ($("#" + id).value || "") ; }).join("\n\n");
        copyText(txt).then(function () { okBtn(b); }, function () { okBtn(b, "Não foi possível"); });
      });
    });
  }

  /* ---------- montador de prompt ---------- */
  function initBuilder() {
    var out = $("#builderOut"); if (!out) return;
    var ids = ["b1", "b2", "b3", "b4", "b5"], names = ["Papel", "Contexto", "Tarefa", "Formato", "Restrições"];
    function up() { out.textContent = ids.map(function (id, i) { return names[i] + ": " + ($("#" + id).value || "").trim(); }).join("\n"); }
    ids.forEach(function (id) { $("#" + id).addEventListener("input", up); }); up();
  }

  /* ---------- declaração de uso ---------- */
  function initDecl() {
    var out = $("#decOut"); if (!out) return;
    var f = function (id) { return ($("#" + id).value || "").trim(); };
    function text() {
      return ["DECLARAÇÃO DE USO DE INTELIGÊNCIA ARTIFICIAL", "",
        "Trabalho: " + (f("d1") || "[título]") + ". Autor(a): " + (f("d2") || "[nome]") + ". Data: " + (f("d3") || "__/__/____") + ".",
        "Ferramenta(s): " + (f("d4") || "[ex.: ChatGPT, Gemini ou Claude, versão gratuita]") + ".",
        "Finalidade do uso: " + (f("d5") || "[ex.: sugestão de recortes de tema; leitura crítica do parágrafo 3; formatação de referências]") + ".",
        "Não utilizei IA para: " + (f("d6") || "[ex.: formulação da tese, interpretação das obras, redação do texto final]") + ".",
        "Verificação: " + ($("#d7").checked ? "todas as referências foram conferidas nas fontes originais." : "[confira as referências nas fontes originais e marque a caixa ao lado]"),
        "Responsabilidade: assumo integralmente o conteúdo deste trabalho.", "", "Assinatura: ____________________________"].join("\n");
    }
    function up() { out.textContent = text(); }
    $$("#declaracao input, #declaracao textarea").forEach(function (e) { e.addEventListener(e.type === "checkbox" ? "change" : "input", up); }); up();
    $("#decDl").addEventListener("click", function () {
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text()], { type: "text/plain;charset=utf-8" })); a.download = "declaracao-de-uso-de-ia.txt"; document.body.appendChild(a); a.click(); a.remove();
    });
    $("#decPrint").addEventListener("click", function () {
      var w = window.open("", "_blank"); if (!w) return;
      w.document.write("<pre style=\"font:16px/1.6 Georgia,serif;white-space:pre-wrap;max-width:720px;margin:40px auto\"></pre>"); w.document.querySelector("pre").textContent = text(); w.document.close(); w.focus(); w.print();
    });
  }

  /* ---------- tokens (ilustrativo) ---------- */
  function initTokens() {
    var inp = $("#tokIn"), out = $("#tokOut"); if (!inp) return;
    var re = /[^aeiouáéíóúâêôãõàAEIOU\s,.;:!?]*[aeiouáéíóúâêôãõàAEIOU]+(?:[^aeiouáéíóúâêôãõàAEIOU\s,.;:!?](?![aeiouáéíóúâêôãõàAEIOU]))?|[,.;:!?]|[^\s]+/g;
    function h(s) { var x = 7; for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) % 49999; return x + 100; }
    function up() {
      var words = inp.value.split(/\s+/).filter(Boolean), html = [];
      words.forEach(function (w, wi) {
        var parts = (w.match(re) || [w]);
        if (parts.length > 3) parts = [parts.slice(0, parts.length - 2).join(""), parts[parts.length - 2], parts[parts.length - 1]];
        parts.forEach(function (p, i) { html.push("<span>" + (i === 0 && wi > 0 ? "▁" : "") + esc(p) + " <small style=\"color:var(--gold2)\">" + h(p.toLowerCase()) + "</small></span>"); });
      });
      out.innerHTML = html.join("");
    }
    inp.addEventListener("input", up); up();
  }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- próxima palavra / temperatura ---------- */
  function initNext() {
    var box = $("#bars"); if (!box) return;
    var W = [["espanto", 41], ["ócio", 22], ["diálogo", 17], ["dúvida", 13], ["medo", 7]];
    var T = $("#temp"), TV = $("#tempV"), draws = [];
    function probs() { var t = parseFloat(T.value), p = W.map(function (w) { return Math.pow(w[1], 1 / t); }), s = p.reduce(function (a, b) { return a + b; }, 0); return p.map(function (x) { return x / s; }); }
    function render() {
      var p = probs(); TV.textContent = parseFloat(T.value).toFixed(1).replace(".", ",");
      box.innerHTML = W.map(function (w, i) { var pc = Math.round(p[i] * 100); return "<div class=\"bar\"><span>" + w[0] + "</span><div class=\"tr\"><i style=\"width:" + pc + "%\"></i></div><span>" + pc + "%</span></div>"; }).join("");
    }
    T.addEventListener("input", render); render();
    $("#draw").addEventListener("click", function () {
      var p = probs(), r = Math.random(), acc = 0, k = 0; for (; k < p.length; k++) { acc += p[k]; if (r <= acc) break; } if (k >= W.length) k = W.length - 1;
      $("#pickW").textContent = W[k][0]; draws.push(W[k][0]); if (draws.length > 10) draws.shift();
      $("#tally").textContent = "Últimos sorteios: " + draws.join(", ") + ". (Valores ilustrativos.) Provável não é o mesmo que verdadeiro.";
    });
  }

  /* ---------- quizzes ---------- */
  var QREF = [
    { q: "ARISTÓTELES. Ética a Nicômaco, livro VI (sobre a prudência).", a: 0, fb: "Real: existe, os dados conferem, trata da prudência (phronesis) e sustenta o argumento." },
    { q: "SILVA, M. A prudência aristotélica na era digital. Revista de Ética Aplicada, 2021.", a: 2, fb: "Inexistente: referência inventada para o exercício. Não se encontra em nenhuma base (passo 1)." },
    { q: "ARISTÓTELES. Ética a Nicômaco, livro X, sobre a prudência.", a: 1, fb: "Real com erro: a obra existe, mas a prudência é tratada no livro VI; o livro X trata do prazer e da felicidade (passo 3: diz isso?)." },
    { q: "PLATÃO. Fedro. Trad. Carlos Alberto Nunes. Belém: Ed. UFPA, 2011.", a: 0, fb: "Real: é a edição citada no minicurso. Confira sempre no catálogo da biblioteca ou na base." },
    { q: "KANT, I. Resposta à pergunta: que é esclarecimento? (1784), no livro Crítica da razão pura.", a: 1, fb: "Real com erro: o texto existe e é de Kant, mas é um ensaio publicado em 1784 na Berlinische Monatsschrift, não parte da Crítica da razão pura." }
  ];
  var REF_OPTS = ["Real", "Real com erro", "Inexistente"];
  var QFAL = [
    { q: "“A IA é confiável porque não erra.”", a: 0, fb: "Petição de princípio: a conclusão (confiável) já está dentro da premissa (não erra)." },
    { q: "“Ou se proíbe a IA, ou se aceita tudo.”", a: 1, fb: "Falso dilema: há alternativas (uso com regras, declaração, verificação) que ficaram fora." },
    { q: "“Disse o ChatGPT, então é verdade.”", a: 2, fb: "Apelo à autoridade: a autoridade é competente e verificável? Um modelo de linguagem não é fonte." },
    { q: "“Esse autor é leigo em computação, logo seu argumento sobre IA está errado.”", a: 3, fb: "Ad hominem: ataca a pessoa, e não o argumento." }
  ];
  var FAL_OPTS = ["Petição de princípio", "Falso dilema", "Apelo à autoridade", "Ad hominem"];
  var QDEL = [
    { q: "Corrigir ortografia e gramática", a: 0, fb: "Pode delegar, com pouco risco (confira se o sentido não mudou)." },
    { q: "Formatar referências na norma ABNT", a: 0, fb: "Pode delegar, mas confira: formatar não é verificar que a referência existe." },
    { q: "Resumir um artigo que você ainda não leu", a: 1, fb: "Com cuidado: leia sempre o original. O resumo pode distorcer ou inventar." },
    { q: "Traduzir um trecho técnico de um autor", a: 1, fb: "Com cuidado: termos técnicos se distorcem com facilidade; confira." },
    { q: "Escolher o problema de pesquisa e a tese", a: 2, fb: "Não delegue: o espanto, a escolha do que merece ser investigado, é seu." },
    { q: "Interpretar o que Kant quis dizer", a: 2, fb: "Não delegue: interpretar os autores exige leitura e juízo seus." },
    { q: "Decidir se uma afirmação é verdadeira", a: 2, fb: "Não delegue: provável não é o mesmo que verdadeiro." },
    { q: "Assinar e responder pelo texto", a: 2, fb: "Não delegue: a máquina não assina nem responde. Autor é quem decide, responde e pode justificar." }
  ];
  var DEL_OPTS = ["Pode delegar", "Com cuidado", "Não delegue"];
  function initQuiz(id, data, opts, scoreId) {
    var box = $("#" + id); if (!box) return; var score = $("#" + scoreId), done = 0, ok = 0;
    box.innerHTML = data.map(function (d, i) {
      return "<div class=\"q\"><p class=\"cite\">" + esc(d.q) + "</p><div class=\"opts\">" + opts.map(function (o, j) { return "<button type=\"button\" data-q=\"" + i + "\" data-o=\"" + j + "\">" + o + "</button>"; }).join("") + "</div><p class=\"fb\"></p></div>";
    }).join("");
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-q]"); if (!b) return; var q = b.closest(".q"); if (q.getAttribute("data-done")) return;
      var d = data[+b.getAttribute("data-q")], j = +b.getAttribute("data-o"), right = j === d.a;
      q.setAttribute("data-done", "1"); done++; if (right) ok++;
      $$("button", q).forEach(function (x) { if (+x.getAttribute("data-o") === d.a) x.classList.add("right"); });
      if (!right) b.classList.add("wrong");
      var fb = $(".fb", q); fb.textContent = (right ? "Acertou. " : "Não é bem isso. ") + d.fb; fb.classList.add("show");
      score.textContent = "Acertos: " + ok + " de " + done + (done === data.length ? " (fim)" : "");
    });
  }

  /* ---------- tabela de referências (Atividade 1) ---------- */
  function initRefs() {
    var tb = $("#refTable tbody"); if (!tb) return;
    var rows = []; try { rows = JSON.parse(store.get("a1-refs") || "[]"); } catch (e) {}
    if (!rows.length) rows = [{}, {}, {}];
    var YN = ["", "Sim", "Não", "Em parte"], CL = ["", "Real", "Real com erro", "Inexistente"];
    function sel(opts, v, k, i) { return "<select data-k=\"" + k + "\" data-i=\"" + i + "\" aria-label=\"" + k + "\">" + opts.map(function (o) { return "<option" + (o === (v || "") ? " selected" : "") + ">" + o + "</option>"; }).join("") + "</select>"; }
    function render() {
      tb.innerHTML = rows.map(function (r, i) {
        return "<tr><td><input type=\"text\" data-k=\"ref\" data-i=\"" + i + "\" value=\"" + esc(r.ref || "") + "\" placeholder=\"Cole a referência\" aria-label=\"Referência " + (i + 1) + "\"></td><td>" + sel(YN, r.ex, "ex", i) + "</td><td>" + sel(YN, r.dd, "dd", i) + "</td><td>" + sel(YN, r.di, "di", i) + "</td><td>" + sel(YN, r.su, "su", i) + "</td><td>" + sel(CL, r.cl, "cl", i) + "</td><td><button class=\"btn sm\" type=\"button\" data-del=\"" + i + "\" aria-label=\"Remover linha " + (i + 1) + "\">×</button></td></tr>";
      }).join("");
    }
    function save() { store.set("a1-refs", JSON.stringify(rows)); var s = $("#savedA1"); s.classList.add("show"); clearTimeout(s._t); s._t = setTimeout(function () { s.classList.remove("show"); }, 1200); }
    tb.addEventListener("input", function (e) { var t = e.target, i = t.getAttribute("data-i"); if (i === null) return; rows[+i][t.getAttribute("data-k")] = t.value; save(); });
    tb.addEventListener("click", function (e) { var b = e.target.closest("[data-del]"); if (!b) return; rows.splice(+b.getAttribute("data-del"), 1); if (!rows.length) rows.push({}); render(); save(); });
    $("#addRef").addEventListener("click", function () { rows.push({}); render(); save(); });
    $(".copy-table").addEventListener("click", function () {
      var txt = ["Referência\tExiste?\tDados conferem?\tDiz isso?\tSustenta?\tClassificação"].concat(rows.map(function (r) { return [r.ref, r.ex, r.dd, r.di, r.su, r.cl].map(function (x) { return x || ""; }).join("\t"); })).join("\n");
      copyText(txt).then(function () { okBtn($(".copy-table")); }, function () {});
    });
    render();
  }

  /* ---------- listas de passos (progresso) ---------- */
  function initSteps() {
    $$(".act").forEach(function (a) {
      var boxes = $$(".steps input", a), bar = $(".prog-line i", a), txt = $(".prog-txt", a);
      function up() { var n = boxes.filter(function (b) { return b.checked; }).length; bar.style.width = (n / boxes.length * 100) + "%"; txt.textContent = n + " de " + boxes.length + " passos concluídos"; boxes.forEach(function (b) { b.closest("li").classList.toggle("done", b.checked); }); }
      boxes.forEach(function (b) { b.addEventListener("change", up); });
      $$(".steps li", a).forEach(function (li) { li.addEventListener("click", function (e) { if (e.target.tagName === "A" || e.target.tagName === "INPUT") return; var c = $("input", li); c.checked = !c.checked; c.dispatchEvent(new Event("change", { bubbles: true })); }); });
      up();
    });
    var pl = $$("#pledge input"), pn = $("#pledgeN");
    function upP() { var n = pl.filter(function (b) { return b.checked; }).length; pl.forEach(function (b) { b.closest(".card").classList.toggle("on", b.checked); }); pn.textContent = n ? (n + " compromisso(s) marcado(s)" + (n > 3 ? ". Dica: comece por três." : ".")) : ""; }
    pl.forEach(function (b) { b.addEventListener("change", upP); }); upP();
  }

  /* ---------- sons e cronômetros ---------- */
  function beep() {
    try { var C = window.AudioContext || window.webkitAudioContext, c = new C(), t = 0;
      [880, 660, 880].forEach(function (f) { var o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; o.connect(g); g.connect(c.destination); g.gain.setValueAtTime(.001, c.currentTime + t); g.gain.exponentialRampToValueAtTime(.25, c.currentTime + t + .02); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + t + .3); o.start(c.currentTime + t); o.stop(c.currentTime + t + .32); t += .38; });
    } catch (e) {}
  }
  function initTimers() {
    $$(".timer").forEach(function (el) {
      var out = $("output", el), go = $('[data-t="go"]', el), rs = $('[data-t="reset"]', el), total = parseFloat(el.getAttribute("data-min")) * 60, left = total, iv = null, endAt = 0;
      function show() { out.textContent = fmt(left * 1000); el.classList.toggle("end", left <= 0); }
      function stop() { clearInterval(iv); iv = null; go.textContent = left > 0 && left < total ? "Continuar" : "Iniciar"; }
      go.addEventListener("click", function () {
        if (iv) { stop(); return; }
        if (left <= 0) left = total; endAt = Date.now() + left * 1000; go.textContent = "Pausar";
        iv = setInterval(function () { left = Math.max(0, (endAt - Date.now()) / 1000); show(); if (left <= 0) { stop(); go.textContent = "Iniciar"; beep(); } }, 250);
      });
      rs.addEventListener("click", function () { stop(); left = total; go.textContent = "Iniciar"; show(); });
      show();
    });
  }

  /* ---------- montador de busca ---------- */
  function initSearch() {
    var o = $("#sOut"); if (!o) return;
    function list(id) { return ($("#" + id).value || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean); }
    function q(s) { return s.indexOf(" ") > -1 ? "\"" + s + "\"" : s; }
    function build() {
      var ex = ($("#s1").value || "").trim(), and = list("s2"), or = list("s3"), not = list("s4"), p = [];
      if (ex) p.push("\"" + ex + "\"");
      and.forEach(function (x) { p.push(q(x)); });
      if (or.length) p.push(or.length > 1 ? "(" + or.map(q).join(" OR ") + ")" : q(or[0]));
      var s = p.join(" AND ");
      not.forEach(function (x) { s += (s ? " " : "") + "NOT " + q(x); });
      o.textContent = s || "Preencha os campos acima.";
      var e = encodeURIComponent(s);
      $("#sGS").href = "https://scholar.google.com.br/scholar?q=" + e;
      $("#sSC").href = "https://search.scielo.org/?q=" + e;
      $("#sPP").href = "https://philpapers.org/s/" + e;
    }
    $$("#s1,#s2,#s3,#s4").forEach(function (i) { i.addEventListener("input", build); }); build();
  }

  /* ---------- roteiro ao vivo e barra do dia ---------- */
  var slots = [];
  function initSchedule() {
    slots = $$(".slot[data-s]").map(function (el) {
      var t = el.querySelector(".ti"); return { el: el, id: el.getAttribute("data-id"), s: at(el.getAttribute("data-s")), e: at(el.getAttribute("data-e")), title: t.childNodes[0].textContent.trim() };
    });
    tick(); setInterval(tick, 1000);
  }
  var gtEnd = 0;
  function tick() {
    var n = now().getTime(), first = slots[0].s, last = slots[slots.length - 1].e, cur = null, idx = -1;
    slots.forEach(function (s, i) { var on = n >= s.s && n < s.e; if (on) { cur = s; idx = i; } s.el.classList.toggle("active", on); s.el.classList.toggle("done", n >= s.e); var tg = $(".tag", s.el); if (tg && !tg._o) tg._o = tg.textContent; if (tg) tg.textContent = on ? "Agora" : tg._o; });
    var live = $("#liveChip"), lt = $("#liveTxt"), bar = $("#daybar"), L = $("#dbLeft"), N = $("#dbNow"), LB = $("#dbLabel"), nx = $("#dbNext"), pr = $("#dbProg");
    var aula = document.body.classList.contains("aula"), within = n > first - 30 * 60000 && n < last + 30 * 60000;
    var status;
    if (cur) {
      status = "Ao vivo agora: " + cur.title; live.classList.add("on");
      LB.textContent = "Agora · " + (cur.id === "intervalo" ? "pausa" : "em andamento"); N.textContent = cur.title; L.textContent = fmt(cur.e - n);
      pr.style.width = ((n - cur.s) / (cur.e - cur.s) * 100) + "%"; var nxt = slots[idx + 1]; nx.textContent = nxt ? "A seguir: " + nxt.title + " (" + nxt.el.getAttribute("data-s").replace(":", "h") + ")" : "Último bloco do dia";
    } else if (n < first) {
      live.classList.remove("on"); var d = Math.ceil((first - n) / 86400000);
      status = n > first - 86400000 ? "Começa hoje às 08h00" : "Faltam " + d + " dia" + (d > 1 ? "s" : "") + " · sexta, 23/10, 08h00";
      LB.textContent = "Começa em"; N.textContent = "Abertura às 08h00"; L.textContent = fmt(first - n); pr.style.width = "0"; nx.textContent = "";
    } else {
      live.classList.remove("on"); status = "Minicurso encerrado. O material continua aqui."; LB.textContent = "Encerrado"; N.textContent = "Obrigado por participar!"; L.textContent = "✓"; pr.style.width = "100%"; nx.textContent = "";
    }
    $("#liveTxt").textContent = status;
    var show = aula || within; bar.classList.toggle("show", show);
    document.documentElement.style.setProperty("--bar-h", show ? bar.offsetHeight + "px" : "0px");
    if (gtEnd) { var r = gtEnd - Date.now(); if (r <= 0) { gtEnd = 0; beep(); $("#dbLeft").style.color = ""; } else { L.textContent = "⏱ " + fmt(r); N.textContent = "Cronômetro da sala"; LB.textContent = "Tempo restante"; L.style.color = "var(--gold2)"; } } else { L.style.color = ""; }
    updateNavOn();
  }

  /* ---------- menu ativo ---------- */
  var navSecs = [];
  function updateNavOn() {
    var y = window.scrollY + 130 + (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--bar-h")) || 0), cur = null;
    navSecs.forEach(function (s) { if (s.el.offsetTop <= y) cur = s; });
    $$("#menu a").forEach(function (a) { a.classList.toggle("on", !!cur && a.getAttribute("href") === "#" + cur.menu); });
  }
  function initNav() {
    var map = { m1: "m1", m2: "m1", m3: "m1", m4: "m1", m5: "m1", fechamento: "m1", atividades: "atividades", prompts: "prompts", ferramentas: "ferramentas", praticar: "praticar", normas: "normas", declaracao: "declaracao", materiais: "materiais", sobre: "sobre", roteiro: "roteiro" };
    navSecs = $$("main > section[id]").filter(function (s) { return map[s.id]; }).map(function (s) { return { el: s, menu: map[s.id] }; });
    window.addEventListener("scroll", updateNavOn, { passive: true });
  }

  /* ---------- modo aula ---------- */
  function setAula(on) {
    document.body.classList.toggle("aula", on); $("#btnAula").setAttribute("aria-pressed", on ? "true" : "false"); store.set("aula", on ? "1" : "0"); tick();
  }
  function goCurrent() {
    var n = now().getTime(), cur = slots.filter(function (s) { return n >= s.s && n < s.e; })[0];
    var id = cur ? cur.id : "roteiro"; if (id === "abertura" || id === "intervalo") id = "roteiro"; if (id === "fechamento") id = "fechamento";
    var t = document.getElementById(id); if (t) t.scrollIntoView({ behavior: "smooth" });
  }
  function secStep(dir) {
    var secs = $$("main > section[id]"), y = window.scrollY + 140, i = 0;
    secs.forEach(function (s, k) { if (s.offsetTop <= y) i = k; });
    var j = Math.max(0, Math.min(secs.length - 1, i + dir)); secs[j].scrollIntoView({ behavior: "smooth" });
  }
  function startGT(min) {
    if (!min) { gtEnd = 0; return; } gtEnd = Date.now() + min * 60000;
  }
  function initAula() {
    $("#btnAula").addEventListener("click", function () { setAula(!document.body.classList.contains("aula")); });
    $("#btnQR").addEventListener("click", function () { $("#qrOv").classList.add("show"); });
    $("#qrOv").addEventListener("click", function () { $("#qrOv").classList.remove("show"); });
    $("#btnFull").addEventListener("click", toggleFull);
    $$("[data-gt]").forEach(function (b) { b.addEventListener("click", function () { startGT(+b.getAttribute("data-gt")); }); });
    $("#helpBtn").addEventListener("click", function () { $("#helpPop").classList.toggle("show"); });
    $$('a[href^="#"]').forEach(function (a) { a.addEventListener("click", function () { setTimeout(updateNavOn, 400); }); });
    document.addEventListener("keydown", function (e) {
      var t = e.target; if (/INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable || e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key.toLowerCase();
      if (k === "escape") { $("#qrOv").classList.remove("show"); $("#helpPop").classList.remove("show"); }
      else if (k === "p") setAula(!document.body.classList.contains("aula"));
      else if (k === "q") $("#qrOv").classList.toggle("show");
      else if (k === "f") toggleFull();
      else if (k === "g") goCurrent();
      else if (k === "t") startGT(10);
      else if (document.body.classList.contains("aula") && (k === "arrowright" || k === "j")) { e.preventDefault(); secStep(1); }
      else if (document.body.classList.contains("aula") && (k === "arrowleft" || k === "k")) { e.preventDefault(); secStep(-1); }
    });
    if (store.get("aula") === "1" || /[?&]aula(=1)?(&|$)/.test(location.search)) setAula(true);
  }
  function toggleFull() { var d = document; if (d.fullscreenElement) d.exitFullscreen(); else if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen(); }

  /* ---------- abre o bloco ativo do roteiro ---------- */
  function openActiveSlot() { var a = $("details.slot.active"); if (a) a.open = true; }

  document.addEventListener("DOMContentLoaded", function () {
    initSave(); initCopy(); initBuilder(); initDecl(); initTokens(); initNext();
    initQuiz("quizRef", QREF, REF_OPTS, "scoreRef"); initQuiz("quizFal", QFAL, FAL_OPTS, "scoreFal"); initQuiz("quizDel", QDEL, DEL_OPTS, "scoreDel");
    initRefs(); initSteps(); initTimers(); initSearch(); initNav(); initSchedule(); initAula(); openActiveSlot();
  });
})();
