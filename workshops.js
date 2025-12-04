/* workshops.js
   Event generation, ICS export, modal signup (AJAX to Formspree), lazy preload images,
   month filter and accessible modal focus trapping.
*/

/* CONFIG */
const WORKSHOP_CONFIG = {
  formspreeEndpoint: 'https://formspree.io/f/mzzngobl',
  timezone: 'UTC', // used for human display; ICS uses UTC times
  startWeekday: 6, // Saturday (0=Sun)
  startTime: '10:00', // HH:MM
  occurrences: 12,
  capacity: 10,
  location: 'Community Hub',
  price: 'Free',
  imagesCount: 6
};

/* Utilities */
function nextWeekdayDate(weekday, fromDate = new Date()) {
  const d = new Date(fromDate);
  const diff = (weekday + 7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + diff);
  d.setHours(0,0,0,0);
  return d;
}
function makeEventDateObj(date, timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}
function pad(n){ return String(n).padStart(2,'0'); }
function toICSDate(dt) {
  // produce YYYYMMDDTHHMMSSZ (UTC)
  const Y = dt.getUTCFullYear(), M = pad(dt.getUTCMonth()+1), D = pad(dt.getUTCDate());
  const hh = pad(dt.getUTCHours()), mm = pad(dt.getUTCMinutes()), ss = pad(dt.getUTCSeconds());
  return `${Y}${M}${D}T${hh}${mm}${ss}Z`;
}
function makeICS(event) {
  const dtstart = toICSDate(event.dtstart);
  const dtend = toICSDate(event.dtend);
  const uid = `yaab-${event.id}@yaabimpact.org.uk`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//YAAB Impact//Workshops//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${(event.description || '').replace(/\n/g,'\\n')}`,
    `LOCATION:${event.location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  return 'data:text/calendar;charset=utf8,' + encodeURIComponent(lines.join('\r\n'));
}

/* Generate events */
function generateWorkshops() {
  const first = nextWeekdayDate(WORKSHOP_CONFIG.startWeekday);
  const events = [];
  for (let i = 0; i < WORKSHOP_CONFIG.occurrences; i++) {
    const base = new Date(first);
    base.setDate(first.getDate() + i * 7);
    const start = makeEventDateObj(base, WORKSHOP_CONFIG.startTime);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours
    events.push({
      id: `ws-${i+1}`,
      title: `Economical Cooking — Week ${i+1}`,
      description: 'Hands-on session teaching low-cost meals, batch cooking and shopping tips to save money and eat healthily.',
      dtstart: start,
      dtend: end,
      location: WORKSHOP_CONFIG.location,
      capacity: WORKSHOP_CONFIG.capacity,
      price: WORKSHOP_CONFIG.price,
      image: `/assets/workshop-bg/img${(i % WORKSHOP_CONFIG.imagesCount) + 1}.jpg`
    });
  }
  return events;
}

/* Render UI */
function renderWorkshopsGrid(events) {
  const grid = document.getElementById('workshop-grid');
  const list = document.getElementById('calendar-list');
  const monthFilter = document.getElementById('month-filter');
  if (!grid || !list || !monthFilter) return;

  // prepare month filter options (unique months in events)
  const monthSet = new Map();
  events.forEach(ev => {
    const key = `${ev.dtstart.getFullYear()}-${ev.dtstart.getMonth()}`;
    if (!monthSet.has(key)) monthSet.set(key, { year: ev.dtstart.getFullYear(), month: ev.dtstart.getMonth() });
  });
  monthFilter.innerHTML = '<option value="all">All months</option>';
  Array.from(monthSet.entries()).forEach(([k, v]) => {
    const label = new Date(v.year, v.month).toLocaleString('default', { month: 'long', year: 'numeric' });
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = label;
    monthFilter.appendChild(opt);
  });

  function paint(filterKey = 'all') {
    grid.innerHTML = '';
    list.innerHTML = '';
    events.forEach(ev => {
      const key = `${ev.dtstart.getFullYear()}-${ev.dtstart.getMonth()}`;
      if (filterKey !== 'all' && key !== filterKey) return;

      // card
      const card = document.createElement('article');
      card.className = 'workshop-card';
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      thumb.style.backgroundImage = `url('${ev.image}')`;
      thumb.setAttribute('aria-hidden','true');
      card.appendChild(thumb);
      const body = document.createElement('div'); body.className='body';
      body.innerHTML = `<h3>${ev.title}</h3><p class="meta">${ev.dtstart.toDateString()} • ${ev.dtstart.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p><p class="excerpt">${ev.description}</p>`;
      const actions = document.createElement('div'); actions.className='actions';
      const btn = document.createElement('button'); btn.className='btn js-open-signup'; btn.textContent='Sign up'; btn.dataset.workshop = ev.title;
      const ics = document.createElement('a'); ics.className='btn ghost'; ics.href = makeICS(ev); ics.download = `${ev.id}.ics`; ics.textContent='Add to calendar';
      actions.appendChild(btn); actions.appendChild(ics);
      body.appendChild(actions);
      card.appendChild(body);
      grid.appendChild(card);

      // list item
      const li = document.createElement('div'); li.className = 'calendar-item';
      li.innerHTML = `<div><strong>${ev.title}</strong><div class="meta">${ev.dtstart.toDateString()} • ${ev.dtstart.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • ${ev.location}</div></div>`;
      const right = document.createElement('div');
      const btn2 = document.createElement('button'); btn2.className='btn js-open-signup'; btn2.textContent='Sign up'; btn2.dataset.workshop = ev.title;
      right.appendChild(btn2);
      li.appendChild(right);
      list.appendChild(li);
    });

    // Attach event listeners for signup buttons
    document.querySelectorAll('.js-open-signup').forEach(b => {
      b.addEventListener('click', e => openSignupModal(e.target.dataset.workshop || 'Workshop'));
    });
  }

  monthFilter.addEventListener('change', (e) => paint(e.target.value));
  paint('all');
}

/* Accessible modal (with focus trap) */
function openSignupModal(workshopTitle) {
  // if modal exists reuse and update title
  let modal = document.getElementById('signup-modal');
  if (modal) {
    modal.querySelector('h3').textContent = `Sign up — ${workshopTitle}`;
    modal.style.display = 'flex';
    trapFocus(modal);
    return;
  }

  modal = document.createElement('div'); modal.id = 'signup-modal';
  modal.innerHTML = `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-card" role="document">
        <button class="modal-close" aria-label="Close">&times;</button>
        <h3 id="modal-title">Sign up — ${workshopTitle}</h3>
        <form id="workshop-signup" action="${WORKSHOP_CONFIG.formspreeEndpoint}" method="POST">
          <input type="hidden" name="workshop" value="${workshopTitle}">
          <label>Name<br><input name="name" required></label><br>
          <label>Email<br><input type="email" name="_replyto" required></label><br>
          <label>Message (optional)<br><textarea name="message"></textarea></label><br>
          <button class="btn" type="submit">Sign me up</button>
        </form>
        <div id="signup-status" aria-live="polite"></div>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const modalBackdrop = modal.querySelector('.modal-backdrop');
  const closeBtn = modal.querySelector('.modal-close');
  const dialog = modal.querySelector('.modal-card');

  // focus management
  const previouslyFocused = document.activeElement;
  trapFocus(modal);

  function closeModal() {
    modal.remove();
    if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    document.removeEventListener('keydown', keyHandler);
  }

  closeBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (ev) => {
    if (ev.target === modalBackdrop) closeModal();
  });

  function keyHandler(e) {
    if (e.key === 'Escape') closeModal();
  }
  document.addEventListener('keydown', keyHandler);

  // Form submit via AJAX (Formspree)
  const frm = modal.querySelector('#workshop-signup');
  const status = modal.querySelector('#signup-status');
  frm.addEventListener('submit', async function(e) {
    e.preventDefault();
    status.textContent = '';
    const btn = frm.querySelector('button[type="submit"]'); btn.disabled = true; btn.textContent = 'Sending…';
    const data = new FormData(frm);
    try {
      const res = await fetch(frm.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' }});
      if (res.ok) {
        status.style.color = 'green'; status.textContent = 'Thanks — your signup has been sent.';
        frm.reset();
        setTimeout(() => { modal.remove(); }, 1400);
      } else {
        const body = await res.json().catch(()=>({}));
        status.style.color = 'crimson'; status.textContent = body.error || 'There was a problem sending your signup.';
      }
    } catch(err) {
      status.style.color = 'crimson'; status.textContent = 'Network error — please try again later.';
    } finally {
      btn.disabled = false; btn.textContent = 'Sign me up';
    }
  });
}

/* Focus trap utility for the modal */
function trapFocus(container) {
  const focusableSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const focusables = Array.from(container.querySelectorAll(focusableSelectors)).filter(el => el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  first.focus();

  function handle(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  container.addEventListener('keydown', handle);
  // remove trap when modal removed
  const observer = new MutationObserver(() => {
    if (!document.body.contains(container)) {
      container.removeEventListener('keydown', handle);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/* Preload workshop images */
function preloadWorkshopImages() {
  for (let i = 1; i <= WORKSHOP_CONFIG.imagesCount; i++) {
    const im = new Image();
    im.src = `/assets/workshop-bg/img${i}.jpg`;
  }
}

/* Init */
document.addEventListener('DOMContentLoaded', function() {
  const events = generateWorkshops();
  renderWorkshopsGrid(events);
  preloadWorkshopImages();
});
