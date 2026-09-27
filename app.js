/* Compa v2 — vanilla JS: nav, sticky header, reveals, forms. */
(function () {
  "use strict";

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  function revealAll() {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    // Safety net: never leave content hidden.
    setTimeout(revealAll, 2500);
  } else {
    revealAll();
  }

  /* ---------- Current year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Shared form helper ---------- */
  function wireForm(formId, opts) {
    var form = document.getElementById(formId);
    if (!form) return;
    // JS takes over validation from here; without JS, native validation + mailto action apply.
    form.setAttribute("novalidate", "");
    var status = form.querySelector(".form-status");

    function setStatus(msg, ok) {
      if (!status) return;
      status.textContent = msg;
      status.className = "form-status " + (ok ? "ok" : "err");
      status.setAttribute("role", "status");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot: bots fill it, humans don't.
      var hp = form.querySelector('input[name="website"]');
      if (hp && hp.value) return; // silently drop

      var data = {};
      var valid = true;
      form.querySelectorAll("input, textarea, select").forEach(function (field) {
        if (field.name === "website" || field.type === "submit") return;
        data[field.name] = field.value.trim();
        if (field.hasAttribute("required") && !field.value.trim()) valid = false;
        if (field.type === "email" && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) valid = false;
      });
      if (!valid) {
        setStatus(opts.invalidMsg || "Please complete the required fields with a valid email.", false);
        return;
      }

      var endpoint = (window.COMPA_CONFIG && window.COMPA_CONFIG[opts.endpointKey]) || "";
      if (endpoint) {
        // Real backend wired — post JSON.
        setStatus("Sending…", true);
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.assign({ form: formId, page: location.pathname }, data))
        }).then(function (res) {
          if (!res.ok) throw new Error("bad status");
          setStatus(opts.successMsg, true);
          form.reset();
        }).catch(function () {
          setStatus("Something went wrong sending that. Please email us directly instead.", false);
        });
      } else {
        // Fallback: open the visitor's email client with a prefilled message.
        var to = (window.COMPA_CONFIG && window.COMPA_CONFIG.contactEmail) || "hello@compa.help";
        var subject = encodeURIComponent(opts.emailSubject || "Compa website signup");
        var body = encodeURIComponent(
          Object.keys(data).map(function (k) { return k + ": " + data[k]; }).join("\n")
        );
        window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;
        setStatus(opts.successMsg + " (Opening your email app to finish…)", true);
        form.reset();
      }
    });
  }

  wireForm("waitlist-form-hero", {
    endpointKey: "waitlistEndpoint",
    emailSubject: "Compa waitlist signup",
    successMsg: "You're on the list — watch your inbox for launch news.",
    invalidMsg: "Please enter a valid email address."
  });
  wireForm("waitlist-form", {
    endpointKey: "waitlistEndpoint",
    emailSubject: "Compa waitlist signup",
    successMsg: "You're on the list — watch your inbox for launch news.",
    invalidMsg: "Please complete the required fields with a valid email."
  });
  wireForm("contact-form", {
    endpointKey: "contactEndpoint",
    emailSubject: "Compa contact message",
    successMsg: "Message ready — thanks for reaching out. We reply within two business days.",
    invalidMsg: "Please complete the required fields with a valid email."
  });
  wireForm("pilot-form", {
    endpointKey: "pilotEndpoint",
    emailSubject: "Compa pilot application",
    successMsg: "Application ready — thanks for your interest in piloting Compa.",
    invalidMsg: "Please complete the required fields with a valid work email."
  });
})();
