export function edgeState(scrollLeft, clientWidth, scrollWidth) {
  return { atStart: scrollLeft <= 1, atEnd: scrollLeft + clientWidth >= scrollWidth - 1 };
}

export function initStrip(root, { reduced }) {
  const track = root.querySelector('[data-track]');
  const prev = root.querySelector('[data-prev]');
  const next = root.querySelector('[data-next]');
  const update = () => {
    const { atStart, atEnd } = edgeState(track.scrollLeft, track.clientWidth, track.scrollWidth);
    prev.disabled = atStart;
    next.disabled = atEnd;
  };
  const go = (dir) => track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' });
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}
