// Public site settings. Empty values leave a feature off.
// web3formsKey: the Verkflo-only access key ("Verkflo Website" form on web3forms.com; keys are designed to be public).
// Do not reuse another site's key, so Verkflo requests stay separate.
// gaId: GA4 measurement ID ("G-XXXXXXXXXX"); clarityId: Microsoft Clarity project ID. Both load only after the visitor accepts the banner.
// Also exposed as window.SITE_CONFIG, which js/analytics.js reads (every page loads this file as a module before it).
export const SITE = { web3formsKey: "78780486-3ec2-4b1f-aebe-685f4e71666a", gaId: "G-ZS6PPHK1SE", clarityId: "zjx4kkfy41" };
globalThis.SITE_CONFIG = SITE;
