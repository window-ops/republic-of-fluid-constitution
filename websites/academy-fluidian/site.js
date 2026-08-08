/* Academia de Lingua Fluidian - dictionary search and the gloss tool.
   Nothing is fetched. Both tools read the lexicon file loaded before this
   one, and the phrase table below. */

const PHRASES = [
  ["skuza me", "excuse me, I am sorry"],
  ["laku noc", "good night"],
  ["bun die", "good day"],
  ["bun matin", "good morning"],
  ["sali", "hello"],
  ["gratias", "thank you"],
  ["me no comprende", "I do not understand"],
  ["parla plus lent, per favor", "please speak more slowly"],
  ["vos parla anglez", "do you speak English"],
  ["que es esto", "what is this"],
  ["quante dura", "how long does it take"],
  ["aqui es se sortida", "the exit is here"],
  ["voca un lekar", "call a doctor"],
  ["me ave dolor aqui", "I have pain here"],
  ["abaxa e tena", "get down and hold on"],
  ["nule persone es lesada", "nobody is injured"],
  ["se tren fa statiun te", "this train stops at"],
  ["prexa statiun es", "the next stop is"],
  ["ia dan zasta", "I cannot give anything"],
  ["me no vole vos desturba", "I do not want to trouble you"]
];

function norm(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
}

/* ---------- dictionary ---------- */

function buildDictionary(rootId, countId, inputId, posId) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const input = document.getElementById(inputId);
  const posSel = document.getElementById(posId);
  const count = document.getElementById(countId);

  function render() {
    const q = norm(input.value);
    const pos = posSel.value;
    const hits = LEX.filter(function (r) {
      if (pos !== "all" && r.p !== pos) return false;
      if (!q) return true;
      return norm(r.f).indexOf(q) === 0 || norm(r.e).indexOf(q) >= 0 || norm(r.f).indexOf(q) >= 0;
    });
    count.textContent = hits.length + " of " + LEX.length + " entries";
    root.innerHTML = hits.slice(0, 400).map(function (r) {
      return '<div class="entry"><p class="gl"><span class="hw">' + r.f + "</span>" +
        (r.i ? '<span class="ipa">' + r.i + "</span>" : "") +
        '<span class="pos">' + r.p + "</span></p>" +
        '<p class="en">' + r.e + "</p>" +
        (r.n ? '<p class="en"><em>' + r.n + "</em></p>" : "") + "</div>";
    }).join("");
  }
  input.addEventListener("input", render);
  posSel.addEventListener("change", render);
  render();
}

/* ---------- gloss tool ---------- */

const F2E = {}, E2F = {};
function indexLexicon() {
  LEX.forEach(function (r) {
    if (r.f.indexOf("-") === 0 || r.f.slice(-1) === "-") return;
    F2E[r.f] = r.e;
    r.e.split(",").forEach(function (g) {
      const key = norm(g);
      if (key && !E2F[key]) E2F[key] = r.f;
    });
  });
}

function glossPhrase(text, dir) {
  const table = dir === "f2e" ? PHRASES : PHRASES.map(function (p) { return [p[1], p[0]]; });
  const t = norm(text);
  for (let i = 0; i < table.length; i++) {
    if (norm(table[i][0]) === t) return table[i][1];
  }
  return null;
}

function glossWords(text, dir) {
  const map = dir === "f2e" ? F2E : E2F;
  const words = norm(text).split(" ").filter(Boolean);
  let unknown = 0;
  const parts = words.map(function (w) {
    let hit = map[w];
    if (!hit && dir === "f2e") {
      if (w.slice(-2) === "es" && map[w.slice(0, -2)]) hit = map[w.slice(0, -2)] + " (pl)";
      else if (w.slice(-1) === "s" && map[w.slice(0, -1)]) hit = map[w.slice(0, -1)] + " (pl)";
    }
    if (!hit) { unknown++; return '<span class="unk">' + w + "</span>"; }
    return hit.split(",")[0].trim();
  });
  return { html: parts.join(" &middot; "), unknown: unknown, total: words.length };
}

function buildTranslator(formId, inId, outId, dirId) {
  const form = document.getElementById(formId);
  if (!form) return;
  indexLexicon();
  const inp = document.getElementById(inId);
  const out = document.getElementById(outId);
  const dirSel = document.getElementById(dirId);

  function run() {
    const dir = dirSel.value;
    const text = inp.value;
    if (!norm(text)) { out.innerHTML = ""; return; }
    const whole = glossPhrase(text, dir);
    const g = glossWords(text, dir);
    let html = "";
    if (whole) {
      html += "<p><strong>" + whole + "</strong></p>";
      html += '<p class="lit">word by word: ' + g.html + "</p>";
    } else {
      html += "<p>" + g.html + "</p>";
      html += '<p class="lit" style="margin-bottom:0">' + (g.total - g.unknown) + " of " + g.total +
        " words found. Words in red are outside the lexicon of this website. This is a gloss, and the word order of the source is kept.</p>";
    }
    out.innerHTML = html;
  }
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  inp.addEventListener("input", run);
  dirSel.addEventListener("change", run);
  run();
}
