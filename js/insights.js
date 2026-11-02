import { onView } from './onview.js';

// Oversight cards: bars and the gauge grow once, the first time each card is on screen.
// Reduced motion never gets .ov-anim, so the markup's end state stays.
export function initInsights(root, { reduced = false } = {}) {
  if (reduced) return;
  root.classList.add('ov-anim');
  for (const card of root.querySelectorAll('.ovc')) {
    let off = null;
    off = onView(card, { enter() { card.classList.add('is-live'); off?.(); }, threshold: 0.35 });
  }
}

// Dark controls section: chart line, audit feed and version circles play while their card is on screen.
export function initControls(root, { reduced = false } = {}) {
  if (reduced) return;
  root.classList.add('is-anim');
  const live = (el) => onView(el, { enter: () => el.classList.add('is-live'), leave: () => el.classList.remove('is-live'), threshold: 0.15 });
  for (const el of root.querySelectorAll('[data-ctl-card], .ctl-item')) live(el);
}
