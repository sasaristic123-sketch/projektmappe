/* Projektmappe: kleine Hilfen, keine Abhängigkeiten, läuft auch direkt aus dem Ordner (file://). */
(function () {
  "use strict";

  // Vorschau ohne Entwurfsmarkierungen: index.html?entwurf=0
  if (/[?&]entwurf=0\b/.test(location.search)) {
    document.body.classList.remove("entwurf");
  }


  // Eigener Audio-Player: großer Abspielknopf, Titel, Fortschrittsleiste und Zeit.
  function fmt(t) {
    if (!isFinite(t)) return "0:00";
    var m = Math.floor(t / 60), sek = Math.floor(t % 60);
    return m + ":" + (sek < 10 ? "0" : "") + sek;
  }
  var alle = Array.prototype.slice.call(document.querySelectorAll("figure > audio"));
  alle.forEach(function (audio) {
    var fig = audio.parentNode;
    var cap = fig.querySelector("figcaption");
    var titel = cap ? cap.textContent : "Audio";
    var tab = (audio.closest("[style*='--tab']") || document.body).style.getPropertyValue("--tab");
    audio.controls = false;
    fig.classList.add("hat-player");

    var box = document.createElement("div");
    box.className = "player";
    box.innerHTML =
      '<button type="button" class="player__knopf" aria-label="' + titel + ' abspielen">' +
        '<svg class="play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
        '<svg class="pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>' +
      '</button>' +
      '<span class="player__titel"></span>' +
      '<div class="player__leiste"><input type="range" min="0" max="1000" value="0" step="1" aria-label="Position in ' + titel + '"><span class="player__zeit">0:00</span></div>';
    box.querySelector(".player__titel").textContent = titel;
    fig.insertBefore(box, audio);

    var knopf = box.querySelector("button");
    var leiste = box.querySelector("input");
    var zeit = box.querySelector(".player__zeit");
    var ziehen = false;

    function anzeigen() {
      var d = audio.duration;
      if (!ziehen && isFinite(d) && d > 0) leiste.value = Math.round(audio.currentTime / d * 1000);
      zeit.textContent = fmt(audio.currentTime) + (isFinite(d) ? " / " + fmt(d) : "");
    }
    knopf.addEventListener("click", function () {
      if (audio.paused) {
        alle.forEach(function (a) { if (a !== audio) a.pause(); });
        audio.play();
      } else { audio.pause(); }
    });
    audio.addEventListener("play", function () {
      box.classList.add("laeuft");
      knopf.setAttribute("aria-label", titel + " pausieren");
    });
    function stopp() {
      box.classList.remove("laeuft");
      knopf.setAttribute("aria-label", titel + " abspielen");
    }
    audio.addEventListener("pause", stopp);
    audio.addEventListener("ended", stopp);
    audio.addEventListener("timeupdate", anzeigen);
    audio.addEventListener("loadedmetadata", anzeigen);
    leiste.addEventListener("input", function () {
      ziehen = true;
      if (isFinite(audio.duration)) audio.currentTime = leiste.value / 1000 * audio.duration;
      anzeigen();
    });
    leiste.addEventListener("change", function () { ziehen = false; });
    audio.preload = "metadata";
  });

  // Registerreiter hebt den Bereich hervor, der gerade im Blick ist.
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".register a[data-bereich]"));
  var bereiche = tabs
    .map(function (a) { return document.getElementById(a.getAttribute("data-bereich")); })
    .filter(Boolean);

  if (!("IntersectionObserver" in window) || !bereiche.length) return;

  function markiere(id) {
    tabs.forEach(function (a) {
      if (a.getAttribute("data-bereich") === id) {
        a.setAttribute("aria-current", "true");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }

  var sichtbar = {};
  var beobachter = new IntersectionObserver(function (eintraege) {
    eintraege.forEach(function (e) { sichtbar[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
    var bester = null, wert = 0;
    bereiche.forEach(function (b) {
      if ((sichtbar[b.id] || 0) > wert) { wert = sichtbar[b.id]; bester = b.id; }
    });
    if (bester) markiere(bester);
  }, { rootMargin: "-20% 0px -50% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });

  bereiche.forEach(function (b) { beobachter.observe(b); });
})();
