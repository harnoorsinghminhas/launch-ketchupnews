/* Ketchup News · shared sign-up + reservation preview. No trackers, no inline script. */
(function () {
"use strict";
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function h(tag, attrs, kids) {
  var e = document.createElement(tag);
  Object.keys(attrs || {}).forEach(function (k) { if (attrs[k] != null) e.setAttribute(k, attrs[k]); });
  (kids || []).forEach(function (c) { e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
  return e;
}

/* ---------- sign-up: one field, email first ---------- */
var API = "https://acp9reat3l.execute-api.us-east-1.amazonaws.com/signal/request-link";
var SITE = "ketchupnews.com";
var LANDING_RE = /^\/[A-Za-z0-9._~!$&'()*+,;=:@%\/-]{0,199}$/;
var EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;
function payload(email, hp) {
  var b = { email: email, hp: hp || "", site: SITE };
  if (LANDING_RE.test(location.pathname)) b.landing_path = location.pathname;
  try { var tz = Intl.DateTimeFormat().resolvedOptions().timeZone; if (tz && tz.length <= 40) b.tz = tz; } catch (e) { /* the API falls back */ }
  var q = location.search;
  if (q && q.length <= 2048 && /[?&](utm_[a-z]+|ref)=/i.test(q)) b.query = q;
  return b;
}
function post(body) {
  var ctl = window.AbortController ? new AbortController() : null, timer = ctl ? window.setTimeout(function () { ctl.abort(); }, 15000) : 0;
  return fetch(API, { method: "POST", mode: "cors", credentials: "omit", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined })
    .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { window.clearTimeout(timer); return { status: r.status, code: j && j.error }; }); },
          function () { window.clearTimeout(timer); return { status: 0, code: "network" }; });
}
function errText(res) {
  var s = res.status, c = res.code;
  if (s === 400 && c === "invalid_email") return "That email address doesn't look right. Check it for a typo?";
  if (s === 400) return "Something in the form didn't go through. Please try again.";
  if (s === 415) return "Your browser sent the form in a format we can't read. Refresh the page and try again.";
  if (s === 429) return "Lots of sign-ups from your network just now. Wait a minute, then try again.";
  if (s === 403) return "Sign-up only works on our own site. Open ketchupnews.com and try again.";
  if (s >= 500) return "Our sign-up desk hit a snag. Please try again in a moment.";
  return "We couldn't reach the sign-up desk. Check your connection and try again.";
}
function validEmail(v) { return v.length <= 254 && EMAIL_RE.test(v); }

$$(".js-join").forEach(function (form) {
  var em = $('input[type="email"]', form), hp = $('input[name="website"]', form), err = $(".js-err", form);
  var btn = $('button[type="submit"]', form), done = $(".js-done", form.parentNode), busy = false;
  em.addEventListener("blur", function () {
    var v = em.value.trim();
    if (v && !validEmail(v)) { err.textContent = "That email address doesn't look right yet."; em.setAttribute("aria-invalid", "true"); }
    else { err.textContent = ""; em.removeAttribute("aria-invalid"); }
  });
  em.addEventListener("input", function () { if (em.getAttribute("aria-invalid") && validEmail(em.value.trim())) { err.textContent = ""; em.removeAttribute("aria-invalid"); } });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy) return;
    var v = em.value.trim();
    if (!validEmail(v)) { err.textContent = "Please enter your email address, like name@example.com."; em.setAttribute("aria-invalid", "true"); em.focus(); return; }
    busy = true; btn.disabled = true; var label = btn.textContent; btn.textContent = "Sending…"; err.textContent = "";
    post(payload(v, hp ? hp.value : "")).then(function (res) {
      busy = false; btn.disabled = false; btn.textContent = label;
      if (res.status === 200) {
        form.hidden = true;
        if (done) {
          while (done.firstChild) done.removeChild(done.firstChild);
          var head = h("h3", { tabindex: "-1" }, ["You're on the preview list."]);
          done.appendChild(head);
          done.appendChild(h("p", { role: "status" }, ["Check your inbox: we sent a link to confirm ", h("b", {}, [v]), ". Tap it and you're in. Everything here is still in preview, and we'll tell you the moment a new piece goes live."]));
          done.hidden = false; head.focus();
        }
        return;
      }
      err.textContent = errText(res);
      if (res.code === "invalid_email") { em.setAttribute("aria-invalid", "true"); em.focus(); }
    });
  });
});

/* ---------- reserve / buy: preview checkout (no payment is taken) ---------- */
var INSIDER = "Reservation holders are insiders: first access to new features, products and prices, sneak peeks by email, and notes from the build room.";
var TIERS = {
  pro: { n: "Pro", get: ["A catch-up made for your role, every weekday", "The full hourly radio-style brief", "Three lanes, full text"], list: "$9.99/mo", found: "$7.99/mo", yr: "$99/yr at launch, $79/yr founding", save: "Save $2/mo, $24/yr, 20%", dep: "$9.99" },
  max: { n: "MAX", get: ["Everything in Pro, every lane in full", "Morning and evening deep dives", "All 24 white papers and the member forum"], list: "$19.99/mo", found: "$14.99/mo", yr: "$199/yr at launch, $149/yr founding", save: "Save $5/mo, $60/yr, 25%", dep: "$29" },
  ultra: { n: "Ultra", get: ["Everything in MAX", "The 21-book library and training by job title", "The full Defense Playbook and the insider circle"], list: "$99.99/mo", found: "$69.99/mo", yr: "$999/yr at launch, $699/yr founding", save: "Save $30/mo, $360/yr, 30%", dep: "$99" }
};
var dlg = $("#checkout"), lastBtn = null;
if (dlg) {
  var open = function () { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); };
  var close = function () { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); };
  var fill = function (list) { var g = $("#coGet"); while (g.firstChild) g.removeChild(g.firstChild); list.forEach(function (x) { g.appendChild(h("li", {}, [x])); }); $("#coStatus").textContent = ""; };
  $$(".js-reserve").forEach(function (b) {
    b.addEventListener("click", function () {
      var T = TIERS[b.getAttribute("data-tier")]; lastBtn = b; fill(T.get);
      $("#co-h").textContent = "Reserve " + T.n;
      $("#coPrice").textContent = "Launch price " + T.list + ". Founding price " + T.found + ", locked while you stay subscribed. " + T.yr + ".";
      $("#coSave").textContent = T.save;
      $("#coPay").textContent = "Reserve for " + T.dep;
      $("#coRefund").textContent = "Refundable on request before launch only. This " + T.dep + " deposit reserves the founding price; it is not a subscription payment. The price shown is the price you pay at checkout.";
      $("#coInsider").textContent = INSIDER; $("#coInsider").hidden = false;
      open();
    });
  });
  $$(".js-buy").forEach(function (b) {
    b.addEventListener("click", function () {
      lastBtn = b; fill(["A 100-page PDF", "The full audio version", "Delivered right away"]);
      $("#co-h").textContent = "Buy the AI-Era Defense Playbook";
      $("#coPrice").textContent = "$49, one-time purchase, all-in.";
      $("#coSave").textContent = "A finished product at its normal price. No discount.";
      $("#coPay").textContent = "Buy for $49";
      $("#coRefund").textContent = "A finished digital product, delivered right away. Read the refund terms before you pay.";
      $("#coInsider").hidden = true;
      open();
    });
  });
  $("#coPay").addEventListener("click", function () { $("#coStatus").textContent = "Founders' Preview: Stripe's hosted checkout (test mode first) connects here. No payment was taken."; });
  $("#coClose").addEventListener("click", close);
  dlg.addEventListener("close", function () { if (lastBtn) lastBtn.focus(); });
}

/* ---------- external links always open in a new tab ---------- */
$$("a[href^='http']:not([href^='https://siagentsignal.com/si/'])").forEach(function (a) { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener"); });
})();
