/* Shared consent-gated analytics: Google Analytics 4 + Microsoft Clarity.
   Canonical copy: C:/Users/abbas/site-ops/analytics/analytics.js — sites vendor this file unchanged.

   Config (window.SITE_CONFIG, set before this script runs):
     gaId       GA4 measurement ID "G-XXXXXXXXXX"
     clarityId  Microsoft Clarity project ID
   Both tools load only after the visitor clicks Accept. With neither ID set, nothing happens.

   Markup the site provides (text and styling are the site's own, in its language):
     [data-consent]        banner, rendered with the `hidden` attribute
     [data-consent-yes]    Accept button inside it
     [data-consent-no]     Decline button inside it
     [data-consent-open]   optional "Cookie choices" control(s), rendered `hidden`

   Events sent to GA4 (scroll, outbound clicks and downloads come from GA4 enhanced measurement):
     contact_click    mailto:, tel:, WhatsApp, Telegram, Calendly/Cal.com/Google Calendar booking links   {method, link_url}
     language_switch  any a[hreflang] link                                       {language}
     cta_click        any element with data-track="name"                         {cta}
   Sites fire generate_lead themselves on a successful form send:
     window.gtag?.("event", "generate_lead", { form: "contact" });            */
(() => {
  const CFG = window.SITE_CONFIG || {};
  if (!CFG.gaId && !CFG.clarityId) return;

  const KEY = "site-consent";
  const store = {
    get: () => { try { return localStorage.getItem(KEY); } catch { return null; } },
    set: (v) => { try { localStorage.setItem(KEY, v); } catch { /* storage blocked */ } },
  };
  const addScript = (src) => {
    const s = document.createElement("script");
    s.src = src; s.async = true;
    document.head.appendChild(s);
  };

  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    if (CFG.gaId) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      window.gtag("js", new Date());
      window.gtag("config", CFG.gaId, { anonymize_ip: true });
      addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(CFG.gaId)}`);
    }
    if (CFG.clarityId) {
      window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
      window.clarity("consent");
      addScript(`https://www.clarity.ms/tag/${encodeURIComponent(CFG.clarityId)}`);
    }
  };
  const revoke = () => {
    if (!loaded) return;
    window.gtag?.("consent", "update", { analytics_storage: "denied" });
    window.clarity?.("consent", false);
  };

  const init = () => {
    const banner = document.querySelector("[data-consent]");
    const choice = store.get();
    if (choice === "yes") load();
    if (!banner) return;
    document.querySelectorAll("[data-consent-open]").forEach((reopen) => {
      reopen.hidden = false;
      reopen.addEventListener("click", () => { banner.hidden = false; banner.querySelector("[data-consent-yes]")?.focus(); });
    });
    if (choice !== "yes" && choice !== "no") banner.hidden = false;
    banner.querySelector("[data-consent-yes]")?.addEventListener("click", () => { store.set("yes"); banner.hidden = true; load(); });
    banner.querySelector("[data-consent-no]")?.addEventListener("click", () => { store.set("no"); banner.hidden = true; revoke(); });
  };

  const CONTACT = [[/^mailto:/i, "email"], [/^tel:/i, "phone"], [/wa\.me|whatsapp\.com/i, "whatsapp"],
                   [/t\.me\//i, "telegram"], [/calendly\.com|cal\.com|calendar\.app\.google|calendar\.google\.com/i, "booking"]];
  document.addEventListener("click", (e) => {
    if (!window.gtag) return;
    const el = e.target.closest?.("a, [data-track]");
    if (!el) return;
    if (el.dataset.track) window.gtag("event", "cta_click", { cta: el.dataset.track });
    const href = el.getAttribute("href") || "";
    const hit = CONTACT.find(([re]) => re.test(href));
    if (hit) window.gtag("event", "contact_click", { method: hit[1], link_url: href });
    if (el.hasAttribute("hreflang")) window.gtag("event", "language_switch", { language: el.getAttribute("hreflang") });
  }, true);

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
