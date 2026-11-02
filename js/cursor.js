const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const isReduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Point inside `target` (fractions fx, fy of its box) relative to the container's top-left.
export function pointIn(target, container, [fx, fy] = [0.6, 0.55]) {
  return { x: target.left - container.left + target.width * fx, y: target.top - container.top + target.height * fy };
}

// Glide the cursor to a target element. The cursor sits in a positioned container (its offsetParent).
// Reduced motion: nothing moves, the promise resolves at once and callers show the end state.
export async function moveCursor(cursor, target, { duration = 1000, at } = {}) {
  if (isReduced()) return;
  const box = cursor.offsetParent ?? cursor.parentElement;
  const { x, y } = pointIn(target.getBoundingClientRect(), box.getBoundingClientRect(), at);
  cursor.style.transition = duration ? `transform ${duration}ms var(--ease-slide)` : 'none';
  cursor.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  await wait(duration);
}

// 150ms press (scale .92) plus a ring ripple.
export async function clickCursor(cursor) {
  if (isReduced()) return;
  cursor.classList.remove('is-click');
  void cursor.offsetWidth;
  cursor.classList.add('is-click');
  await wait(150);
  setTimeout(() => cursor.classList.remove('is-click'), 450);
}
