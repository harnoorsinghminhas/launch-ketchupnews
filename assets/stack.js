(function () {
"use strict";
var list = document.getElementById("cards"); if (!list) return;
var cards = Array.prototype.slice.call(list.children), pos = document.getElementById("pos");
var prev = document.getElementById("prev"), next = document.getElementById("next"), cur = 0;
function go(i) {
  cur = Math.max(0, Math.min(cards.length - 1, i));
  list.scrollTo({ left: cards[cur].offsetLeft - list.offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}
function sync() {
  var w = cards[0].offsetWidth, i = Math.round((list.scrollLeft) / (w + 12));
  cur = Math.max(0, Math.min(cards.length - 1, i));
  pos.textContent = "Card " + (cur + 1) + " of " + cards.length;
  prev.disabled = cur === 0; next.disabled = cur === cards.length - 1;
}
prev.addEventListener("click", function () { go(cur - 1); });
next.addEventListener("click", function () { go(cur + 1); });
list.addEventListener("scroll", function () { window.requestAnimationFrame(sync); }, { passive: true });
list.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); } });
sync();
var status = document.getElementById("shareNote");
Array.prototype.forEach.call(document.querySelectorAll(".share"), function (b) {
  b.addEventListener("click", function () {
    var c = b.closest(".card"), a = c.querySelector(".src a");
    var text = c.querySelector("h3").textContent + "\n" + c.querySelector(".plain").textContent + "\nSource: " + a.textContent.replace(/ \(opens in a new tab\)/, "") + " " + a.href + "\nvia Ketchup News, ketchupnews.com";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { status.textContent = "Copied, with its source. Paste it anywhere."; }, function () { status.textContent = "Couldn't copy here. Select the card text to share it."; });
    } else { status.textContent = "Couldn't copy here. Select the card text to share it."; }
  });
});
})();
