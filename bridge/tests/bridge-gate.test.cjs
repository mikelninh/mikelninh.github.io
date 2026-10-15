const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

function boot(query = "") {
  const nodes = new Map();
  function node(name) {
    return {
      name,
      value: "", innerHTML: "", textContent: "", hidden: false,
      checked: false, disabled: false,
      dataset: {}, listeners: {},
      classList: { toggle() {} },
      addEventListener(type, fn) { this.listeners[type] = fn; },
      setAttribute() {}, setCustomValidity() {},
      reportValidity() { return true; }, focus() {},
      scrollIntoView() {}, querySelectorAll() { return []; },
    };
  }
  const scenarios = ["medtech", "climate", "saas"].map(key => Object.assign(node(key), { dataset: { case: key } }));
  const document = {
    getElementById(name) {
      if (!nodes.has(name)) nodes.set(name, node(name));
      return nodes.get(name);
    },
    querySelectorAll(selector) {
      return selector === ".scenario" ? scenarios : [];
    },
  };
  const localStorage = {
    getItem() { return null; },
    setItem() {},
  };
  const window = { location: { search: query }, innerWidth: 1100 };
  const script = fs.readFileSync(path.resolve(__dirname, "../app.js"), "utf8");
  vm.runInNewContext(script, { document, localStorage, window, URLSearchParams });
  return {
    nodes, scenarios,
    api: window.BRIDGE_TEST,
    choose(key) { scenarios.find(s => s.dataset.case === key).listeners.click(); },
    request(text) {
      nodes.get("founder-question").value = text;
      nodes.get("match-btn").listeners.click();
      return nodes.get("report").innerHTML;
    },
  };
}

test("the default fictional startup case is available", () => {
  const app = boot();
  assert.equal(app.api.mode, "deterministic curated matching");
  assert.equal(app.api.resources.length, 8);
  assert.equal(app.nodes.get("founder-question").value.includes("Diagnose-Prototyp"), true);
});

test("an unfamiliar founder request must NOT receive an unrelated preset match", () => {
  const app = boot();
  const html = app.request("Unser Projekt bringt einen Geigenunterricht in Schulen für Kinder.");
  assert.match(html, /kenne ich noch keine passende Unterstützung/);
  assert.match(html, /Kein Matching durchgeführt/);
  assert.doesNotMatch(html, /RESSOURCE 0[1-3]/);
  assert.doesNotMatch(html, /BfArM|MDR\/IVDR|Corporate Network/);
});

test("three known request categories receive justified public resource recommendations", () => {
  const app = boot();
  const cases = [
    ["medtech", "Wir brauchen klinische Pilotpartner für unser neues Diagnoseverfahren.", "BfArM"],
    ["climate", "Wir suchen Industriepiloten für unser Batteriesystem und Energie-Speicher.", "Corporate Network"],
    ["saas", "Unser SaaS will einen wiederholbaren B2B Sales Prozess etablieren.", "HTGF Academy"],
  ];
  for (const [key, input, expected] of cases) {
    app.choose(key);
    const html = app.request(input);
    assert.match(html, new RegExp(expected));
    assert.match(html, /Originalquelle/);
    assert.match(html, /Kein Zugriff auf HTGF-Systeme/i);
    assert.match(html, /disabled/); // Human review is required before export.
    assert.equal((html.match(/class="resource"/g) || []).length, 3);
  }
});

test("typed user needs override the sample initially selected", () => {
  const app = boot();
  app.choose("medtech");
  const html = app.request("Wir möchten unsere SaaS Software mit B2B Vertrieb skalieren.");
  assert.match(html, /HTGF Academy/);
  assert.doesNotMatch(html, /BfArM/);
});

test("scenario-specific share links deep-link correctly", () => {
  const app = boot("?case=climate");
  assert.match(app.nodes.get("founder-question").value, /Batteriesystem/);
  const noMatch = app.request("Wir brauchen ein Instrument für unsere Musikschule.");
  assert.match(noMatch, /Kein Matching durchgeführt/);
});
