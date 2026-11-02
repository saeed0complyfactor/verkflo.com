export function nextIndex(key, i, n) {
  switch (key) {
    case 'ArrowRight': case 'ArrowDown': return (i + 1) % n;
    case 'ArrowLeft': case 'ArrowUp': return (i - 1 + n) % n;
    case 'Home': return 0;
    case 'End': return n - 1;
    default: return -1;
  }
}

export function initTabs(root, { onChange } = {}) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  let index = 0;

  function select(i, { focus = false, user = false } = {}) {
    index = i;
    tabs.forEach((t, j) => {
      const on = j === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[j].hidden = !on;
    });
    if (focus) tabs[i].focus({ preventScroll: true });
    onChange?.(i, { user });
  }

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i, { user: true }));
    t.addEventListener('keydown', (e) => {
      const j = nextIndex(e.key, i, tabs.length);
      if (j < 0) return;
      e.preventDefault();
      select(j, { focus: true, user: true });
    });
  });

  select(Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')));
  return { select, get index() { return index; }, get count() { return tabs.length; } };
}
