(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    /* Mobile Navigation Toggle */
    var toggleButton = document.querySelector(".menu-toggle");
    var navLinks = document.querySelector(".nav-links");

    if (toggleButton && navLinks) {
      toggleButton.addEventListener("click", function (e) {
        e.preventDefault();
        var isOpen = navLinks.classList.toggle("is-open");
        toggleButton.setAttribute("aria-expanded", String(isOpen));
        toggleButton.innerHTML = isOpen 
          ? '<i class="fa fa-times" aria-hidden="true"></i>' 
          : '<i class="fa fa-bars" aria-hidden="true"></i>';
      });

      navLinks.querySelectorAll("li a").forEach(function (link) {
        link.addEventListener("click", function () {
          navLinks.classList.remove("is-open");
          toggleButton.setAttribute("aria-expanded", "false");
          toggleButton.innerHTML = '<i class="fa fa-bars" aria-hidden="true"></i>';
        });
      });
    }

    /* Scroll Spy for Active Navigation Link */
    var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]")).filter(function (s) {
      return document.querySelector('.nav-links a[href="#' + s.id + '"]');
    });
    var navItems = document.querySelectorAll(".nav-links li");

    function highlightNav() {
      var scrollPos = window.scrollY + window.innerHeight * 0.28;
      var currentId = sections.length ? sections[0].id : null;
      
      sections.forEach(function (section) {
        if (section.offsetTop <= scrollPos) {
          currentId = section.id;
        }
      });

      navItems.forEach(function (li) {
        var link = li.querySelector("a");
        if (link && link.getAttribute("href") === "#" + currentId) {
          li.classList.add("current");
        } else {
          li.classList.remove("current");
        }
      });
    }

    /* Scroll Frame Loop */
    var scrollTicking = false;
    var progressBar = document.querySelector(".scroll-progress-bar");
    var header = document.querySelector("header");

    function onScrollFrame() {
      highlightNav();

      if (progressBar) {
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        progressBar.style.width = pct + "%";
      }

      if (header) {
        if (window.scrollY > 40) {
          header.classList.add("is-scrolled");
        } else {
          header.classList.remove("is-scrolled");
        }
      }

      scrollTicking = false;
    }

    window.addEventListener("scroll", function () {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(onScrollFrame);
      }
    }, { passive: true });
    onScrollFrame();

    /* Smooth Scrolling for Anchor Links */
    document.querySelectorAll("a[href^='#']").forEach(function (link) {
      link.addEventListener("click", function (e) {
        var hash = this.getAttribute("href");
        if (!hash || hash === "#") return;
        var target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
        if (history.pushState) {
          history.pushState(null, "", hash);
        }
      });
    });

    /* Floating Social Bar Auto-hide */
    var socialFloating = document.querySelector(".intro-social-floating");
    var introSection = document.getElementById("intro");
    if (socialFloating && introSection) {
      function toggleSocial() {
        var introBottom = introSection.offsetTop + introSection.offsetHeight;
        if (window.scrollY + window.innerHeight * 0.4 > introBottom) {
          socialFloating.classList.add("is-hidden");
        } else {
          socialFloating.classList.remove("is-hidden");
        }
      }
      window.addEventListener("scroll", toggleSocial, { passive: true });
      toggleSocial();
    }

    /* Footer Year Auto-update */
    var yearEl = document.getElementById("footer-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });
})();
