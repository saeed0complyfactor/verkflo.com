import { onView } from './onview.js';
import { moveCursor, clickCursor } from './cursor.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const shown = (el) => el && el.getClientRects().length > 0;

// Cursor visits the sidebar item, a connector row and the Rules row, clicking each, only while visible.
export function initHeroDemo(stage, { reduced }) {
  const cursor = stage.querySelector('.cursor');
  if (reduced || !cursor) return;
  const pick = (k) => stage.querySelector(`[data-pick="${k}"]`);
  const side = pick('side'), kyc = pick('side-kyc');
  let run = 0;

  const reset = () => {
    kyc.classList.add('is-active');
    stage.querySelectorAll('[data-pick]').forEach((el) => el !== kyc && el.classList.remove('is-picked', 'is-active'));
  };
  async function loop(id) {
    const alive = () => id === run;
    cursor.classList.add('is-on');
    await moveCursor(cursor, stage.querySelector('.appwin__main'), { duration: 0, at: [0.5, 0.9] });
    while (alive()) {
      for (const k of ['side', 'conn', 'rules']) {
        const el = pick(k);
        if (!shown(el)) continue; // the sidebar is hidden on small screens
        await moveCursor(cursor, el, { duration: 1100 });
        if (!alive()) return;
        await clickCursor(cursor);
        if (!alive()) return;
        if (k === 'side') { kyc.classList.remove('is-active'); side.classList.add('is-active'); } else el.classList.add('is-picked');
        await wait(900);
        if (!alive()) return;
      }
      await wait(600);
      reset();
      await wait(500);
    }
  }
  onView(stage, {
    enter() { loop(++run); },
    leave() { run++; cursor.classList.remove('is-on'); reset(); },
  });
}
