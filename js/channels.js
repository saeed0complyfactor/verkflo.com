// Highlight the sidebar item whose app window is most in view; clicking an item scrolls its window into view.
export function initChannels(root, { reduced = false } = {}) {
  const items = [...root.querySelectorAll('[data-chan]')];
  const wins = [...root.querySelectorAll('[data-chan-win]')];
  const ratios = new Map();
  const mark = () => {
    let best = null;
    for (const w of wins) if (!best || (ratios.get(w) || 0) > (ratios.get(best) || 0)) best = w;
    if (!best || !ratios.get(best)) return;
    for (const a of items) a.classList.toggle('is-active', a.dataset.chan === best.id);
  };
  if ('IntersectionObserver' in globalThis) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) ratios.set(e.target, e.intersectionRatio);
      mark();
    }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) });
    wins.forEach((w) => io.observe(w));
  }
  for (const a of items) {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(a.dataset.chan)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    });
  }
}
