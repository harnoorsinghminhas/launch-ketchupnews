/* "This hour": renders the public hourly brief from https://siagentsignal.com/data/latest.json (GitHub Pages, CORS *, mirrored hourly).
   Every node is created with createElement + textContent (no innerHTML), so the page runs under require-trusted-types-for 'script'.
   If the fetch fails the section shows a calm "warming up" note instead of a broken box. */
(function () {
"use strict";
var FEED = "https://siagentsignal.com/data/latest.json";
var MEDIA_OK = /^https:\/\/media\.theagentsignal\.com\//;
var root = document.getElementById("this-hour");
if (!root) return;
function $(id) { return document.getElementById(id); }
var warm = $("hour-warm"), list = $("hour-stories"), upd = $("hour-updated"), cnt = $("hour-count"), aud = $("hour-audio"),
    player = $("hour-player"), secs = $("hour-secs"), tid = $("hour-tid"), tick = $("hour-ticker"), tickWrap = $("hour-ticker-wrap");
var generated = null, timer = 0;

function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function safeUrl(u) { return typeof u === "string" && /^https:\/\//i.test(u) ? u : ""; }
function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
function rel(iso) {
  var t = Date.parse(iso);
  if (isNaN(t)) return "";
  var m = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return plural(m, "minute") + " ago";
  var h = Math.round(m / 60);
  if (h < 24) return plural(h, "hour") + " ago";
  return plural(Math.round(h / 24), "day") + " ago";
}
function labelClass(l) { return l === "CONFIRMED" ? "lab-conf" : l === "STILL OPEN" ? "lab-open" : "lab-rep"; }
function link(href, text) {
  var u = safeUrl(href);
  if (!u) return el("span", "hour-title", text);
  var a = el("a", "hour-title", text);
  a.setAttribute("href", u); a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener noreferrer");
  return a;
}
function showWarm() {
  warm.hidden = false; clear(list); aud.hidden = true; tid.textContent = ""; cnt.textContent = "";
  if (tickWrap) tickWrap.hidden = true;
  upd.textContent = "";
}
function tickAge() { if (generated) upd.textContent = "Updated " + rel(generated); }

function render(d) {
  var stories = Array.isArray(d && d.stories) ? d.stories.slice(0, 5) : [];
  if (!stories.length) { showWarm(); return; }
  warm.hidden = true; clear(list);
  stories.forEach(function (s) {
    if (!s || typeof s.title !== "string") return;
    var label = typeof s.label === "string" ? s.label.toUpperCase() : "REPORTED";
    var li = el("li", "hour-story");
    li.appendChild(el("span", "hour-lab " + labelClass(label), label));
    li.appendChild(link(s.url, s.title));
    if (typeof s.summary_1line === "string" && s.summary_1line) li.appendChild(el("p", "hour-sum", s.summary_1line));
    var outlet = s.outlet_name || s.outlet;
    if (outlet) {
      var when = s.published_at ? " · " + rel(s.published_at) : "";
      li.appendChild(el("p", "hour-src", "Source: " + outlet + when));
    }
    list.appendChild(li);
  });
  generated = d.generated_at; tickAge();
  cnt.textContent = d.articles_24h_label ? "We read " + d.articles_24h_label + " articles in the last 24 hours." : "";
  var a = typeof d.audio_url === "string" && MEDIA_OK.test(d.audio_url) && d.audio_status === "ok" ? d.audio_url : "";
  if (a) {
    player.setAttribute("src", a);
    secs.textContent = typeof d.audio_seconds === "number" ? Math.round(d.audio_seconds) + " seconds" : "this hour";
    aud.hidden = false;
  } else { aud.hidden = true; }
  tid.textContent = typeof d.tidbit === "string" ? d.tidbit : "";
  clear(tick);
  var items = Array.isArray(d.ticker) ? d.ticker.slice(0, 12) : [];
  items.forEach(function (t) {
    if (!t || typeof t.headline !== "string") return;
    var li = el("li", "hour-tk");
    li.appendChild(link(t.url, t.headline));
    if (t.outlet_name || t.outlet) li.appendChild(el("span", "hour-tk-o", " · " + (t.outlet_name || t.outlet)));
    tick.appendChild(li);
  });
  if (tickWrap) tickWrap.hidden = tick.children.length === 0;
}

function load() {
  var ctl = window.AbortController ? new AbortController() : null, to = ctl ? window.setTimeout(function () { ctl.abort(); }, 12000) : 0;
  fetch(FEED, { mode: "cors", credentials: "omit", signal: ctl ? ctl.signal : undefined })
    .then(function (r) { if (!r.ok) throw new Error("status " + r.status); return r.json(); })
    .then(function (d) { window.clearTimeout(to); render(d); schedule(600000); })
    .catch(function () { window.clearTimeout(to); showWarm(); schedule(120000); });
}
function schedule(ms) { window.clearTimeout(timer); timer = window.setTimeout(load, ms); }
window.setInterval(tickAge, 60000);
load();
})();
