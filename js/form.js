import { SITE } from '/site-config.js';

const ENDPOINT = 'https://api.web3forms.com/submit';
const FALLBACK = "Online requests aren't switched on yet. Please email hello@verkflo.com and we'll find a time.";

// "first name, last name and work email"
export const joinList = (names) => (names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0] ?? '');

// Message for the fields that failed validation: [{ label, type, value }].
export const missingMessage = (bad) =>
  bad.length === 1 && bad[0].type === 'email' && bad[0].value
    ? "That email address doesn't look complete. Please check it."
    : `Please add your ${joinList(bad.map((f) => f.label.toLowerCase()))}.`;

const labelOf = (f, form) => form.querySelector(`label[for="${f.id}"]`).textContent.replace('*', '').trim();

export function initDemoForm(form, { config = SITE, fetchFn = fetch } = {}) {
  if (!form) return;
  const msg = form.querySelector('[data-msg]');
  const btn = form.querySelector('button[type="submit"]');
  // Errors interrupt (alert); success is polite (status). Set the role before the text so the right one announces.
  const show = (text, cls) => {
    msg.setAttribute('role', cls === 'err' ? 'alert' : 'status');
    msg.setAttribute('aria-live', cls === 'err' ? 'assertive' : 'polite');
    msg.textContent = text;
    msg.className = `dform__msg ${cls || ''}`.trim();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    show('');
    const req = [...form.querySelectorAll('[required]')];
    req.forEach((f) => {
      const ok = f.checkValidity();
      f.setAttribute('aria-invalid', String(!ok));
      if (ok) f.removeAttribute('aria-describedby'); else f.setAttribute('aria-describedby', msg.id);
    });
    const bad = req.filter((f) => !f.checkValidity());
    if (bad.length) {
      show(missingMessage(bad.map((f) => ({ label: labelOf(f, form), type: f.type, value: f.value }))), 'err');
      bad[0].focus();
      return;
    }
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      if (!config.web3formsKey) throw new Error('no-endpoint');
      const data = Object.fromEntries(new FormData(form));
      if (data.botcheck) throw new Error('http');
      const payload = { ...data, access_key: config.web3formsKey, replyto: data.email, name: `${data.first_name} ${data.last_name}` };
      const res = await fetchFn(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || out.success === false) throw new Error('http');
      show("Thank you. We'll be in touch to find a time.", 'ok');
      form.reset();
    } catch (err) {
      show(err.message === 'no-endpoint' ? FALLBACK : "That didn't go through. Please check your connection and try again.", 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
  form.querySelectorAll('input, select, textarea').forEach((f) => f.addEventListener('input', () => { f.removeAttribute('aria-invalid'); f.removeAttribute('aria-describedby'); }));
}
