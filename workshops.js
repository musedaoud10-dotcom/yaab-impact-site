// Workshops functionality: Event generation, ICS creator, modal signup, and filtering

document.addEventListener('DOMContentLoaded', () => {
  // -----------------------------------------
  // Workshop Event Data Generation
  // -----------------------------------------
  
  /**
   * Get the next upcoming Saturday at 10:00 UTC
   * Note: If today is Saturday, this returns next Saturday (7 days away)
   * to ensure workshops are scheduled in the future.
   */
  function getNextSaturday() {
    const now = new Date();
    const day = now.getUTCDay();
    // When day is Saturday (6): (6-6+7)%7 = 0, then 0||7 = 7 (next Saturday)
    // For other days: calculates days until Saturday
    const daysUntilSaturday = (6 - day + 7) % 7 || 7;
    const nextSaturday = new Date(now);
    nextSaturday.setUTCDate(now.getUTCDate() + daysUntilSaturday);
    nextSaturday.setUTCHours(10, 0, 0, 0);
    return nextSaturday;
  }

  /**
   * Generate 12 weekly workshop events
   */
  function generateWorkshopEvents() {
    const events = [];
    const startDate = getNextSaturday();
    const images = [
      'assets/workshop-bg/img1.jpg',
      'assets/workshop-bg/img2.jpg',
      'assets/workshop-bg/img3.jpg',
      'assets/workshop-bg/img4.jpg',
      'assets/workshop-bg/img5.jpg',
      'assets/workshop-bg/img6.jpg'
    ];

    for (let i = 0; i < 12; i++) {
      const eventDate = new Date(startDate);
      eventDate.setUTCDate(startDate.getUTCDate() + (i * 7));
      
      const endDate = new Date(eventDate);
      endDate.setUTCHours(eventDate.getUTCHours() + 2); // 2 hour duration

      events.push({
        id: i + 1,
        title: `Economical Cooking — Week ${i + 1}`,
        description: 'Join us for a hands-on workshop where we explore budget-friendly recipes, meal planning strategies, and techniques to reduce food waste while creating delicious, nutritious meals.',
        date: eventDate,
        endDate: endDate,
        location: 'Community Hub',
        capacity: 10,
        price: 'Free',
        image: images[i % images.length]
      });
    }

    return events;
  }

  // Store generated events globally
  window.workshopEvents = generateWorkshopEvents();

  // -----------------------------------------
  // Date/Time Formatting
  // -----------------------------------------

  /**
   * Format date for human-friendly display
   */
  function formatDate(date) {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-GB', options);
  }

  /**
   * Format time for human-friendly display
   */
  function formatTime(date) {
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }

  /**
   * Get short month name
   */
  function getMonthShort(date) {
    return date.toLocaleDateString('en-GB', { month: 'short' });
  }

  /**
   * Get day of month
   */
  function getDayOfMonth(date) {
    return date.getDate();
  }

  // -----------------------------------------
  // ICS File Generator
  // -----------------------------------------

  /**
   * Format date for ICS file (YYYYMMDDTHHMMSSZ)
   */
  function formatDateForICS(date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  /**
   * Generate ICS file content
   */
  function generateICS(event) {
    const uid = `workshop-${event.id}-${event.date.getTime()}@yaabimpact.org.uk`;
    const dtstamp = formatDateForICS(new Date());
    const dtstart = formatDateForICS(event.date);
    const dtend = formatDateForICS(event.endDate);
    
    // Escape special characters in text fields
    const escapeText = (text) => {
      return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//YAAB Impact//Workshops//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${escapeText(event.title)}`,
      `DESCRIPTION:${escapeText(event.description)}`,
      `LOCATION:${escapeText(event.location)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  }

  /**
   * Download ICS file
   */
  function downloadICS(event) {
    const icsContent = generateICS(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Expose downloadICS globally
  window.downloadICS = downloadICS;

  // -----------------------------------------
  // Workshop Cards Rendering
  // -----------------------------------------

  /**
   * Create workshop card HTML
   */
  function createWorkshopCard(event) {
    const card = document.createElement('article');
    card.className = 'workshop-card reveal';
    card.dataset.eventId = event.id;
    card.dataset.month = event.date.getMonth();

    card.innerHTML = `
      <div class="workshop-card-image loading">
        <img src="${event.image}" alt="${event.title}" loading="lazy">
      </div>
      <div class="workshop-card-content">
        <h3 class="workshop-card-title">${event.title}</h3>
        <div class="workshop-card-meta">
          <span>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${formatDate(event.date)}
          </span>
          <span>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${formatTime(event.date)} (2 hours)
          </span>
          <span>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${event.location}
          </span>
        </div>
        <p class="workshop-card-excerpt">${event.description.substring(0, 100)}...</p>
        <div class="workshop-card-actions">
          <button class="btn primary signup-btn" data-event-id="${event.id}">Sign up</button>
          <button class="btn secondary calendar-btn" data-event-id="${event.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <path d="M9 16l2 2 4-4"></path>
            </svg>
            Add to Calendar
          </button>
        </div>
      </div>
    `;

    // Handle image load
    const img = card.querySelector('img');
    const imageContainer = card.querySelector('.workshop-card-image');
    img.addEventListener('load', () => {
      imageContainer.classList.remove('loading');
    });
    img.addEventListener('error', () => {
      imageContainer.classList.remove('loading');
      img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect fill="#e0e0e0" width="800" height="600"/><text x="400" y="300" text-anchor="middle" fill="#999">Image unavailable</text></svg>');
    });

    return card;
  }

  /**
   * Create calendar list item HTML
   */
  function createCalendarItem(event) {
    const item = document.createElement('div');
    item.className = 'calendar-item';
    item.dataset.eventId = event.id;
    item.dataset.month = event.date.getMonth();

    item.innerHTML = `
      <div class="calendar-item-date">
        <span class="day">${getDayOfMonth(event.date)}</span>
        <span class="month">${getMonthShort(event.date)}</span>
      </div>
      <div class="calendar-item-info">
        <h4 class="calendar-item-title">${event.title}</h4>
        <p class="calendar-item-meta">
          ${formatTime(event.date)} • ${event.location} • <span class="workshop-badge free">${event.price}</span>
        </p>
      </div>
      <div class="calendar-item-actions">
        <button class="btn primary signup-btn" data-event-id="${event.id}">Sign up</button>
        <a href="#" class="add-to-calendar calendar-btn" data-event-id="${event.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <line x1="12" y1="14" x2="12" y2="18"></line>
            <line x1="10" y1="16" x2="14" y2="16"></line>
          </svg>
          Add to calendar
        </a>
      </div>
    `;

    return item;
  }

  /**
   * Render workshop grid
   */
  function renderWorkshopGrid(containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    const events = limit ? window.workshopEvents.slice(0, limit) : window.workshopEvents;
    
    events.forEach(event => {
      container.appendChild(createWorkshopCard(event));
    });

    // Trigger reveal animations
    requestAnimationFrame(() => {
      container.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('revealed');
      });
    });
  }

  /**
   * Render calendar list
   */
  function renderCalendarList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    window.workshopEvents.forEach(event => {
      container.appendChild(createCalendarItem(event));
    });
  }

  // -----------------------------------------
  // Month Filter
  // -----------------------------------------

  /**
   * Get unique months from events
   */
  function getUniqueMonths() {
    const months = new Set();
    window.workshopEvents.forEach(event => {
      const monthKey = `${event.date.getFullYear()}-${event.date.getMonth()}`;
      months.add(monthKey);
    });
    return Array.from(months).map(key => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month), 1);
      return {
        key,
        label: date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
        month: parseInt(month),
        year: parseInt(year)
      };
    });
  }

  /**
   * Render month filter buttons
   */
  function renderMonthFilter(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const months = getUniqueMonths();
    
    // Add "All" button
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'All';
    allBtn.dataset.filter = 'all';
    container.appendChild(allBtn);

    // Add month buttons
    months.forEach(month => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.textContent = month.label;
      btn.dataset.filter = month.key;
      btn.dataset.month = month.month;
      container.appendChild(btn);
    });

    // Add click handlers
    container.addEventListener('click', (e) => {
      if (!e.target.classList.contains('filter-btn')) return;
      
      // Update active state
      container.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      // Filter items
      const filter = e.target.dataset.filter;
      filterByMonth(filter);
    });
  }

  /**
   * Filter calendar items by month
   */
  function filterByMonth(filter) {
    const calendarItems = document.querySelectorAll('.calendar-item');
    const workshopCards = document.querySelectorAll('.workshop-card');

    [...calendarItems, ...workshopCards].forEach(item => {
      if (filter === 'all') {
        item.style.display = '';
      } else {
        const [year, month] = filter.split('-');
        const itemMonth = parseInt(item.dataset.month);
        item.style.display = (itemMonth === parseInt(month)) ? '' : 'none';
      }
    });
  }

  // -----------------------------------------
  // Signup Modal
  // -----------------------------------------

  const modalHTML = `
    <div class="modal-backdrop" id="modal-backdrop" aria-hidden="true"></div>
    <div class="modal" id="signup-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-header">
        <h2 class="modal-title" id="modal-title">Sign up for Workshop</h2>
        <button class="modal-close" id="modal-close" aria-label="Close modal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="workshop-signup-form" class="modal-form" novalidate>
          <input type="hidden" name="workshop" id="workshop-title-input">
          <div class="form-row">
            <label for="signup-name">Name <span aria-hidden="true">*</span></label>
            <input type="text" id="signup-name" name="name" required>
            <span class="error" id="signup-name-error" aria-live="polite"></span>
          </div>
          <div class="form-row">
            <label for="signup-email">Email <span aria-hidden="true">*</span></label>
            <input type="email" id="signup-email" name="_replyto" required>
            <span class="error" id="signup-email-error" aria-live="polite"></span>
          </div>
          <div class="form-row">
            <label for="signup-message">Message (optional)</label>
            <textarea id="signup-message" name="message" rows="3" placeholder="Any dietary requirements or questions?"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn primary" id="signup-submit">Sign up</button>
          </div>
          <p id="signup-form-message" class="form-message" role="status" aria-live="polite"></p>
        </form>
        <div class="modal-success" id="signup-success" style="display: none;">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3>You're signed up!</h3>
          <p>We'll send you a confirmation email shortly.</p>
        </div>
      </div>
    </div>
  `;

  // Inject modal into page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('signup-modal');
  const backdrop = document.getElementById('modal-backdrop');
  const closeBtn = document.getElementById('modal-close');
  const form = document.getElementById('workshop-signup-form');
  const successUI = document.getElementById('signup-success');
  const workshopTitleInput = document.getElementById('workshop-title-input');
  let currentEventId = null;
  let focusableElements = [];
  let firstFocusable = null;
  let lastFocusable = null;
  let previousActiveElement = null;

  /**
   * Open modal
   */
  function openModal(eventId) {
    const event = window.workshopEvents.find(e => e.id === parseInt(eventId));
    if (!event) return;

    currentEventId = eventId;
    previousActiveElement = document.activeElement;

    // Set workshop title
    workshopTitleInput.value = event.title;
    document.getElementById('modal-title').textContent = `Sign up: ${event.title}`;

    // Reset form state
    form.reset();
    form.style.display = '';
    successUI.style.display = 'none';
    document.querySelectorAll('.modal-form .error').forEach(el => el.textContent = '');
    document.getElementById('signup-form-message').textContent = '';

    // Show modal
    modal.classList.add('open');
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Setup focus trap
    focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable = focusableElements[0];
    lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus first element
    setTimeout(() => {
      firstFocusable.focus();
    }, 100);
  }

  /**
   * Close modal
   */
  function closeModal() {
    modal.classList.remove('open');
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentEventId = null;

    // Restore focus
    if (previousActiveElement) {
      previousActiveElement.focus();
    }
  }

  // Event listeners for modal
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }

    // Focus trap
    if (e.key === 'Tab' && modal.classList.contains('open')) {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });

  // Form validation and submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const formMessage = document.getElementById('signup-form-message');
    let hasError = false;

    // Clear previous errors
    document.querySelectorAll('.modal-form .error').forEach(el => el.textContent = '');
    formMessage.textContent = '';
    formMessage.style.color = '';

    // Validation helpers
    const setError = (input, message) => {
      const errorEl = document.getElementById(input.id + '-error');
      if (errorEl) errorEl.textContent = message;
      hasError = true;
    };

    // Validate name
    if (!nameInput.value.trim()) {
      setError(nameInput, 'Please enter your name.');
    }

    // Validate email
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      setError(emailInput, 'Please enter your email.');
    } else if (!emailRx.test(emailInput.value.trim())) {
      setError(emailInput, 'Please enter a valid email address.');
    }

    if (hasError) return;

    // Submit to Formspree
    const submitBtn = document.getElementById('signup-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const formData = new FormData(form);
      const response = await fetch('https://formspree.io/f/mzzngobl', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        // Show success UI
        form.style.display = 'none';
        successUI.style.display = 'block';

        // Close modal after delay
        setTimeout(() => {
          closeModal();
        }, 3000);
      } else {
        const body = await response.json().catch(() => ({}));
        formMessage.style.color = 'crimson';
        formMessage.textContent = body.error || 'Sorry — there was a problem with your signup.';
      }
    } catch (err) {
      formMessage.style.color = 'crimson';
      formMessage.textContent = 'Network error — please try again later.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign up';
    }
  });

  // -----------------------------------------
  // Event Delegation for Buttons
  // -----------------------------------------

  document.addEventListener('click', (e) => {
    // Sign up button
    if (e.target.classList.contains('signup-btn')) {
      e.preventDefault();
      const eventId = e.target.dataset.eventId;
      openModal(eventId);
    }

    // Add to calendar button
    if (e.target.classList.contains('calendar-btn') || e.target.closest('.calendar-btn')) {
      e.preventDefault();
      const btn = e.target.classList.contains('calendar-btn') ? e.target : e.target.closest('.calendar-btn');
      const eventId = btn.dataset.eventId;
      const event = window.workshopEvents.find(ev => ev.id === parseInt(eventId));
      if (event) {
        downloadICS(event);
      }
    }
  });

  // -----------------------------------------
  // Initialize on page
  // -----------------------------------------

  // Render workshop grid if container exists
  renderWorkshopGrid('workshops-grid');
  
  // Render calendar list if container exists
  renderCalendarList('calendar-list');
  
  // Render month filter if container exists
  renderMonthFilter('month-filter');

  // Render homepage preview (limited to 3 cards)
  renderWorkshopGrid('workshops-preview-grid', 3);
});
