/* ============================================================
   Compa website configuration — EDIT HERE before launch.
   ============================================================ */
window.COMPA_CONFIG = {
  // Canonical public URL of the site.
  siteUrl: "https://compa.help",

  // Public inbox (contact page, footer, form fallback).
  contactEmail: "hello@compa.help",

  // Partnerships / pilot inbox (agencies page).
  partnersEmail: "hello@compa.help",

  // Form endpoints. Leave blank to use the email-client fallback.
  // Set to a real HTTPS endpoint (e.g. a serverless function) to
  // capture submissions as JSON: { form, page, name, email, ... }
  waitlistEndpoint: "",
  contactEndpoint: "",
  pilotEndpoint: ""
};
