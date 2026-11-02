// Run `enter` when el scrolls into view and `leave` when it scrolls out. Returns a disconnect function.
export function onView(el, { enter, leave, threshold = 0.25 } = {}) {
  if (!('IntersectionObserver' in globalThis)) { enter?.(); return () => {}; }
  let visible = false;
  const io = new IntersectionObserver((entries) => {
    const now = entries[entries.length - 1].isIntersecting;
    if (now === visible) return;
    visible = now;
    (now ? enter : leave)?.();
  }, { threshold });
  io.observe(el);
  return () => io.disconnect();
}
