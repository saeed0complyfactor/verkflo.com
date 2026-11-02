import { onView } from './onview.js';

const ROW = 40;

// Steps through the inputs; the branch the rules choose for the active input lights up.
// Reduced motion draws the connectors once and keeps the first pair active.
export function initRouter(root, { reduced = false } = {}) {
  const list = root.querySelector('.router__inputs');
  const win = root.querySelector('.router__win');
  const pill = root.querySelector('.router__pill');
  const branches = [...root.querySelectorAll('[data-branch]')];
  const real = [...list.children];
  const n = real.length;
  let all = real;
  let i = 0;

  const link = (a, b, c, d) => `M${a} ${b}C${(a + c) / 2} ${b} ${(a + c) / 2} ${d} ${c} ${d}`;
  const draw = () => {
    const r = root.getBoundingClientRect();
    const mid = pill.getBoundingClientRect(), w = win.getBoundingClientRect();
    const y = mid.top + mid.height / 2 - r.top;
    root.querySelector('.router__in').setAttribute('d', `M${w.right - r.left + 12} ${y}H${mid.left - r.left}`);
    const b = branches.find((x) => x.classList.contains('is-active')).getBoundingClientRect();
    root.querySelector('.router__out').setAttribute('d', link(mid.right - r.left, y, b.left - r.left - 4, b.top + b.height / 2 - r.top));
  };
  const show = () => {
    all.forEach((li, k) => li.classList.toggle('is-active', k === i));
    const to = all[i].dataset.to;
    branches.forEach((b) => b.classList.toggle('is-active', b.dataset.branch === to));
    list.style.transform = reduced ? '' : `translateY(${(win.clientHeight - ROW) / 2 - i * ROW}px)`;
    draw();
  };

  if (!reduced) {
    root.classList.add('is-anim');
    // Copies before and after make the scroll loop without a visible jump.
    const copy = () => real.map((li) => Object.assign(li.cloneNode(true), { ariaHidden: 'true' }));
    const pre = copy(), post = copy();
    list.prepend(...pre);
    list.append(...post);
    all = [...pre, ...real, ...post];
    i = n;
  } else i = 0;
  show();
  addEventListener('resize', draw);
  if (reduced) return;

  let t;
  const tick = () => {
    i++;
    show();
    if (i === 2 * n) {
      // Same content one copy earlier: jump back without a transition.
      setTimeout(() => {
        list.style.transition = 'none';
        i = n;
        show();
        list.offsetHeight;
        list.style.transition = '';
      }, 520);
    }
  };
  onView(root, { enter() { clearInterval(t); t = setInterval(tick, 1600); }, leave() { clearInterval(t); } });
}
