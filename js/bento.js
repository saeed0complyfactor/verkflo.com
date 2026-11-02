import { onView } from './onview.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Run `step` every `ms` while `el` is on screen.
function every(el, step, ms) {
  let t;
  onView(el, { enter() { clearInterval(t); t = setInterval(step, ms); }, leave() { clearInterval(t); } });
}

// The "used by all" bento. CSS animations (float, scan line, globe) run while a card has .is-live;
// roles, orbit and the trigger card are driven here. Reduced motion keeps the static markup.
export function initBento(root, { reduced = false } = {}) {
  const card = (k) => root.querySelector(`[data-gb="${k}"]`);
  for (const c of root.querySelectorAll('.gb__card')) {
    onView(c, { enter: () => c.classList.add('is-live'), leave: () => c.classList.remove('is-live') });
  }
  if (reduced) return;
  root.classList.add('is-anim');

  const cycle = (items, ms, host) => {
    let i = 0;
    every(host, () => {
      items[i].classList.remove('is-active');
      i = (i + 1) % items.length;
      items[i].classList.add('is-active');
    }, ms);
  };
  cycle([...card('roles').querySelectorAll('[data-role]')], 3000, card('roles'));
  cycle([...card('orbit').querySelectorAll('[data-orb]')], 1600, card('orbit'));

  const trig = card('trigger');
  const steps = [...trig.querySelectorAll('[data-step]')];
  let run = 0;
  onView(trig, {
    enter() {
      const id = ++run;
      (async () => {
        while (id === run) {
          steps.forEach((s) => s.classList.remove('is-in'));
          await wait(900);
          for (const s of steps) {
            if (id !== run) return;
            s.classList.add('is-in');
            await wait(s.classList.contains('tg__type') ? 650 : 900);
          }
          await wait(4000);
        }
      })();
    },
    leave() { run++; },
  });
}
