import { initTabs } from './tabs.js';
import { onView } from './onview.js';

export function timeline(n, { start = 400, stepMs = 900, pauseAt = -1, pauseMs = 1800, holdMs = 3000 } = {}) {
  const steps = [];
  let t = start;
  for (let i = 0; i < n; i++) {
    const done = t + stepMs + (i === pauseAt ? pauseMs : 0);
    steps.push({ appear: t, done });
    t = done;
  }
  return { steps, summary: t, end: t + holdMs };
}

function play(panel, reduced, onEnd) {
  const steps = [...panel.querySelectorAll('.run-step')];
  const timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));

  if (reduced) {
    steps.forEach((s) => { s.dataset.state = 'done'; });
    panel.dataset.state = 'done';
    return () => {};
  }

  const t = timeline(steps.length, { pauseAt: steps.findIndex((s) => s.hasAttribute('data-pause')) });
  panel.dataset.state = 'playing';
  steps.forEach((s, i) => {
    delete s.dataset.state;
    at(t.steps[i].appear, () => { s.dataset.state = 'running'; });
    at(t.steps[i].done, () => { s.dataset.state = 'done'; });
  });
  at(t.summary, () => { panel.dataset.state = 'done'; });
  at(t.end, onEnd);
  return () => timers.forEach(clearTimeout);
}

export function initRunDemo(root, { reduced }) {
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];
  let cancel = () => {};
  let finished = false;
  let autoplay = !reduced;
  let visible = false;
  let started = false; // first time the card is seen; playback never restarts on later intersection changes
  let api;

  // Only advances while the card is on screen; finished is cleared first so repeated calls cannot chain.
  const advance = () => {
    if (!(autoplay && finished && visible) || root.matches(':hover, :focus-within')) return;
    finished = false;
    api.select((api.index + 1) % api.count);
  };
  const start = (i, { user }) => {
    cancel();
    if (user) autoplay = false;
    finished = false;
    if (!reduced && !started) return; // playback begins when the card first scrolls into view
    cancel = play(panels[i], reduced, () => { finished = true; advance(); });
  };

  root.addEventListener('pointerleave', advance);
  root.addEventListener('focusout', () => setTimeout(advance, 0));
  api = initTabs(root, { onChange: start });
  if (!reduced) {
    onView(root, {
      enter: () => {
        visible = true;
        if (started) return advance(); // a run that ended off-screen moves on now
        started = true;
        start(api.index, { user: false });
      },
      leave: () => { visible = false; },
    });
  }
}
