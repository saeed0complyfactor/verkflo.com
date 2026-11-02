import { onView } from './onview.js';
import { initTabs } from './tabs.js';
import { moveCursor, clickCursor } from './cursor.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const steps = (root) => root.dataset.times.split(',').map(Number);

function count(el, to) {
  cancelAnimationFrame(el._raf);
  const end = +el.dataset.count;
  if (!to) { el.textContent = '0'; return; }
  const t0 = performance.now();
  const frame = (t) => {
    const p = Math.min(1, (t - t0) / 900);
    el.textContent = String(Math.round(end * p));
    if (p < 1) el._raf = requestAnimationFrame(frame);
  };
  el._raf = requestAnimationFrame(frame);
}

// Show the state after step n: [data-s] in, [data-until] out, [data-lit] highlighted, [data-cs] counted up.
export function setStep(root, n, animate = true) {
  root.querySelectorAll('[data-s]').forEach((el) => el.classList.toggle('is-on', +el.dataset.s <= n));
  root.querySelectorAll('[data-until]').forEach((el) => el.classList.toggle('is-gone', +el.dataset.until <= n));
  root.querySelectorAll('[data-lit]').forEach((el) => el.classList.toggle('is-lit', +el.dataset.lit <= n));
  root.querySelectorAll('[data-cs]').forEach((el) => {
    const on = +el.dataset.cs <= n;
    if (on === el.classList.contains('is-on')) return;
    el.classList.toggle('is-on', on);
    if (animate) count(el, on); else { cancelAnimationFrame(el._raf); el.textContent = on ? el.dataset.count : '0'; }
  });
}
const full = (root, animate) => setStep(root, steps(root).length, animate);

// Waits ms, but the clock stops while held() is true. False when the run was cancelled.
async function tick(ms, alive, held) {
  for (let left = ms; left > 0;) {
    if (!alive()) return false;
    await sleep(50);
    if (!held()) left -= 50;
  }
  return alive();
}

async function glide(root) {
  const cur = root.querySelector('.cursor'), btn = root.querySelector('[data-click]');
  cur.classList.add('is-on');
  await moveCursor(cur, btn, { duration: 1000 });
  await clickCursor(cur);
}

async function play(root, alive, held) {
  const t = steps(root);
  for (let i = 0; i < t.length; i++) {
    if (!(await tick(t[i], alive, held))) return false;
    if (+root.dataset.cursorAt === i + 1) { await glide(root); if (!alive()) return false; }
    setStep(root, i + 1);
  }
  return true;
}

function reset(root) {
  setStep(root, 0, false);
  const cur = root.querySelector('.cursor');
  if (cur) { cur.classList.remove('is-on'); cur.style.transition = 'none'; cur.style.transform = 'translate(70%, 90%)'; }
}

// Small looping visuals: play while on screen, hold the end state, start over.
export function initFacts(root, { reduced = false } = {}) {
  for (const el of root.querySelectorAll('[data-fv]')) {
    if (reduced) { full(el, false); continue; }
    let run = 0;
    reset(el);
    onView(el, {
      enter() {
        const id = ++run, alive = () => id === run, never = () => false;
        (async () => {
          while (alive()) {
            if (!(await play(el, alive, never)) || !(await tick(2600, alive, never))) return;
            setStep(el, 0, false);
            if (!(await tick(900, alive, never))) return;
          }
        })();
      },
      leave() { run++; reset(el); },
    });
  }
}

// Tabs that each play their own animation, then move on. Hover/focus pauses; a click stops the auto-advance.
export function initStage(root, { reduced = false } = {}) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  const title = root.querySelector('[data-title]');
  let auto = true, visible = false, held = false, run = 0, current = 0;

  const start = () => {
    const id = ++run, alive = () => id === run, i = current;
    panels.forEach(reset);
    (async () => {
      if (!(await play(panels[i], alive, () => false)) || !auto) return;
      if (!(await tick(2800, alive, () => held))) return;
      api.select((i + 1) % tabs.length);
    })();
  };
  const api = initTabs(root, {
    onChange(i, { user }) {
      current = i;
      title.textContent = panels[i].dataset.title;
      if (user) auto = false;
      run++;
      panels.forEach(reset);
      if (reduced) full(panels[i], false);
      else if (visible) start();
    },
  });
  if (reduced) return;
  const hold = (v) => () => { held = v; };
  root.addEventListener('mouseenter', hold(true));
  root.addEventListener('mouseleave', hold(false));
  root.addEventListener('focusin', hold(true));
  root.addEventListener('focusout', hold(false));
  onView(root, {
    enter() { visible = true; start(); },
    leave() { visible = false; run++; panels.forEach(reset); },
  });
}
