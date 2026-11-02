import { initTabs } from './tabs.js';
import { initRunDemo } from './rundemo.js';
import { initStrip } from './carousel.js';
import { initReveal } from './reveal.js';
import { initHeroDemo } from './herodemo.js';
import { initReviewDemo } from './reviewdemo.js';
import { initChannels } from './channels.js';
import { initBento } from './bento.js';
import { initRouter } from './router.js';
import { initInsights, initControls } from './insights.js';
import { initDemoForm } from './form.js';
import { initFacts, initStage } from './screens.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');
initReveal({ reduced });

const nav = document.querySelector('.nav');
const toggle = nav.querySelector('.nav__toggle');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('#nav-menu a').forEach((a) => a.addEventListener('click', () => {
  nav.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
}));
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !nav.classList.contains('is-open')) return;
  nav.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.focus();
});

for (const el of document.querySelectorAll('[data-tabs]')) {
  if (el.hasAttribute('data-rundemo')) { initRunDemo(el, { reduced }); continue; }
  initTabs(el);
}
for (const el of document.querySelectorAll('[data-strip]')) initStrip(el, { reduced });
for (const el of document.querySelectorAll('[data-herodemo]')) initHeroDemo(el, { reduced });
for (const el of document.querySelectorAll('.bento')) initReviewDemo(el, { reduced });
// Homepage-only components: the other pages don't have these roots.
const $ = (s) => document.querySelector(s);
if ($('#channels')) initChannels($('#channels'), { reduced });
if ($('[data-gb-root]')) initBento($('[data-gb-root]'), { reduced });
if ($('[data-router]')) initRouter($('[data-router]'), { reduced });
if ($('[data-insights]')) initInsights($('[data-insights]'), { reduced });
if ($('[data-ctl]')) initControls($('[data-ctl]'), { reduced });
initFacts(document, { reduced });
for (const el of document.querySelectorAll('[data-stage]')) initStage(el, { reduced });
for (const f of document.querySelectorAll('[data-demo-form]')) initDemoForm(f);
