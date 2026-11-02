import { onView } from './onview.js';
import { moveCursor, clickCursor } from './cursor.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Each bento card loops only while on screen. Reduced motion (or no IntersectionObserver loop) shows the end state.
export function initReviewDemo(root, { reduced }) {
  const card = (k) => root.querySelector(`[data-bento="${k}"]`);
  const $ = (el, sel) => el.querySelector(sel);

  const ccase = card('case'), main = $(ccase, '.bmock__main'), cursor = $(ccase, '.cursor');
  const hook = card('webhook'), srcs = [...hook.querySelectorAll('.hook__src li')], hookPill = $(hook, '.hook__pill');
  const vault = $(card('vault'), '.vault__pill');
  const chat = [...card('human').querySelectorAll('.cm')];
  const rec = $(card('record'), '.rec__win'), list = $(rec, '.rec__list');

  if (reduced) {
    main.dataset.on = 'b';
    hookPill.dataset.on = 'b'; srcs[0].classList.add('is-lit');
    vault.dataset.on = 'b';
    chat.forEach((m) => m.classList.add('is-in'));
    rec.classList.add('is-static');
    return;
  }

  // A second copy inside one track makes the upward scroll seamless.
  const track = Object.assign(document.createElement("div"), { className: "rec__track" });
  list.replaceWith(track);
  track.append(list, Object.assign(list.cloneNode(true), { ariaHidden: "true" }));

  // Run `scene(alive)` on enter, cancel on leave; `reset` puts the card back to its start state.
  const play = (el, scene, reset) => {
    let run = 0;
    onView(el, {
      enter() { const id = ++run; scene(() => id === run); },
      leave() { run++; reset(); },
    });
  };

  play(ccase, async (alive) => {
    const btn = $(ccase, '[data-target]');
    cursor.classList.add('is-on');
    await moveCursor(cursor, $(ccase, '.bmock__table'), { duration: 0, at: [0.7, 0.9] });
    while (alive()) {
      await wait(700);
      if (!alive()) return;
      await moveCursor(cursor, btn, { duration: 1100 });
      if (!alive()) return;
      await clickCursor(cursor);
      main.dataset.on = 'b';
      await wait(2400);
      main.dataset.on = 'a';
      await moveCursor(cursor, $(ccase, '.bmock__table'), { duration: 900, at: [0.7, 0.9] });
    }
  }, () => { cursor.classList.remove('is-on'); main.dataset.on = 'a'; });

  play(hook, async (alive) => {
    for (let i = 0; alive(); i = (i + 1) % srcs.length) {
      srcs.forEach((s, j) => s.classList.toggle('is-lit', j === i));
      hookPill.dataset.on = 'a';
      await wait(1700);
      if (!alive()) return;
      hookPill.dataset.on = 'b';
      await wait(1900);
    }
  }, () => { srcs.forEach((s) => s.classList.remove('is-lit')); hookPill.dataset.on = 'a'; });

  play(card('vault'), async (alive) => {
    while (alive()) {
      vault.dataset.on = 'a';
      await wait(1800);
      if (!alive()) return;
      vault.dataset.on = 'b';
      await wait(2400);
    }
  }, () => { vault.dataset.on = 'a'; });

  play(card('human'), async (alive) => {
    while (alive()) {
      chat.forEach((m) => m.classList.remove('is-in'));
      await wait(600);
      if (!alive()) return;
      chat[0].classList.add('is-in');
      await wait(1500);
      if (!alive()) return;
      chat[1].classList.add('is-in');
      await wait(3800);
    }
  }, () => chat.forEach((m) => m.classList.remove('is-in')));

  play(card('record'), () => rec.classList.add('is-running'), () => rec.classList.remove('is-running'));
}
