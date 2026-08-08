/* National Railways Federation - site behaviour.

   Nothing on this site needs scripting to be read. The timetable, the routes,
   the station list, the card specification and the comparison are all in the
   markup. This file marks the current page in the navigation; the two
   demonstrations contain their own scripts on their own pages. */

(function () {
  "use strict";

  function markNav() {
    var here = location.pathname.replace(/index\.html$/, "");
    var links = document.querySelectorAll(".nav a");
    for (var i = 0; i < links.length; i++) {
      if (links[i].pathname.replace(/index\.html$/, "") === here) {
        links[i].setAttribute("aria-current", "page");
      }
    }
  }

  /* The header groups are <details>. Without script they open on a tap and
     close on a second one. With script: only one stands open, a pointer
     opens one on hover, and a click elsewhere or the escape key closes it. */
  function groups() {
    var all = Array.prototype.slice.call(document.querySelectorAll(".nav .grp"));
    if (!all.length) return;
    var hoverable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var shutTimer = null;

    /* A fixed panel needs its position set, since it no longer sits
       under its summary by layout alone. Placed on open, and again on a
       resize or a sideways scroll of the bar. */
    function place(g) {
      var ul = g.querySelector('ul');
      var sum = g.querySelector('summary');
      if (!ul || !sum) { return; }
      var bar = g.closest('.nav').getBoundingClientRect();
      var box = sum.getBoundingClientRect();
      ul.style.top = bar.bottom + 'px';
      var left = Math.max(4, Math.min(box.left, window.innerWidth - ul.offsetWidth - 4));
      ul.style.left = left + 'px';
    }

    function placeOpen() {
      all.forEach(function (g) { if (g.open) { place(g); } });
    }

    window.addEventListener('resize', placeOpen);
    window.addEventListener('scroll', placeOpen, true);

    function closeAll(except) {
      all.forEach(function (g) {
        if (g !== except) g.removeAttribute("open");
      });
    }

    all.forEach(function (g) {
      var sum = g.querySelector("summary");

      sum.addEventListener("click", function () {
        if (!g.open) closeAll(g);
        window.setTimeout(function () { if (g.open) place(g); }, 0);
      });

      g.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          g.removeAttribute("open");
          sum.focus();
        }
      });

      if (hoverable) {
        g.addEventListener("mouseenter", function () {
          window.clearTimeout(shutTimer);
          closeAll(g);
          g.setAttribute("open", "");
          place(g);
        });
        g.addEventListener("mouseleave", function () {
          shutTimer = window.setTimeout(function () {
            g.removeAttribute("open");
          }, 220);
        });
      }

      g.addEventListener("focusout", function (e) {
        if (!g.contains(e.relatedTarget)) g.removeAttribute("open");
      });
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav .grp")) closeAll(null);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    markNav();
    groups();
  });
})();
