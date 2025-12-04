// Workshops functionality: event generation, ICS download, modal signup

document.addEventListener('DOMContentLoaded', () => {
  // Configuration
  const WORKSHOP_CONFIG = {
    title: 'Economical Cooking',
    totalWeeks: 12,
    startHour: 10, // 10:00 UTC
    durationHours: 2,
    capacity: 10,
    location: 'Community Hub',
    price: 'Free',
    description: 'Learn budget-friendly meal preparation techniques in this hands-on workshop. Each week covers different topics including meal planning, ingredient substitution, batch cooking, and reducing food waste.'
  };

  const WORKSHOP_IMAGES = [
    'assets/workshop-bg/img1.svg',
    'assets/workshop-bg/img2.svg',
    'assets/workshop-bg/img3.svg',
    'assets/workshop-bg/img4.svg',
    'assets/workshop-bg/img5.svg',
    'assets/workshop-bg/img6.svg'
  ];

  const WEEK_TOPICS = [
    'Meal Planning Basics',
    'Smart Shopping Strategies',
    'Batch Cooking Essentials',
    'One-Pot Wonders',
    'Freezer-Friendly Meals',
    'Leftovers Reinvented',
    'Seasonal Eating',
    'Plant-Based on a Budget',
    'Quick Weeknight Dinners',
    'Healthy Snacks',
    'Food Storage Tips',
    'Celebration Meals'
  ];

  /**
   * Get the next upcoming Saturday from today
   */
  function getNextSaturday() {
    const today = new Date();
    const dayOfWeek = today.getUTCDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7; // If today is Saturday, get next Saturday
    const nextSaturday = new Date(today);
    nextSaturday.setUTCDate(today.getUTCDate() + daysUntilSaturday);
    nextSaturday.setUTCHours(WORKSHOP_CONFIG.startHour, 0, 0, 0);
    return nextSaturday;
  }

  /**
   * Generate 12 weekly workshop events
   */
  function generateWorkshops() {
    const workshops = [];
    const startDate = getNextSaturday();

    for (let i = 0; i < WORKSHOP_CONFIG.totalWeeks; i++) {
      const eventDate = new Date(startDate);
      eventDate.setUTCDate(startDate.getUTCDate() + (i * 7));
      
      const endDate = new Date(eventDate);
      endDate.setUTCHours(eventDate.getUTCHours() + WORKSHOP_CONFIG.durationHours);

      workshops.push({
        id: `workshop-week-${i + 1}`,
        week: i + 1,
        title: `${WORKSHOP_CONFIG.title} — Week ${i + 1}`,
        topic: WEEK_TOPICS[i % WEEK_TOPICS.length] || `Week ${i + 1}`,
        startDate: eventDate,
        endDate: endDate,
        location: WORKSHOP_CONFIG.location,
        capacity: WORKSHOP_CONFIG.capacity,
        price: WORKSHOP_CONFIG.price,
        description: WORKSHOP_CONFIG.description,
        image: WORKSHOP_IMAGES[i % WORKSHOP_IMAGES.length]
      });
    }

    return workshops;
  }

  /**
   * Format date for display
   */
  function formatDate(date) {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'UTC'
    };
    return date.toLocaleDateString('en-GB', options);
  }

  /**
   * Format time for display
   */
  function formatTime(date) {
    const options = { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'UTC',
      hour12: false
    };
    return date.toLocaleTimeString('en-GB', options) + ' UTC';
  }

  /**
   * Format date for ICS file (YYYYMMDDTHHMMSSZ)
   */
  function formatICSDate(date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  }

  /**
   * Generate ICS file content for a workshop
   */
  function generateICS(workshop) {
    const uid = `${workshop.id}@yaabimpact.org.uk`;
    const now = new Date();
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YAAB Impact//Workshops//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(now)}
DTSTART:${formatICSDate(workshop.startDate)}
DTEND:${formatICSDate(workshop.endDate)}
SUMMARY:${workshop.title}
DESCRIPTION:${workshop.topic}. ${workshop.description.replace(/\n/g, '\\n')}
LOCATION:${workshop.location}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;
  }

  /**
   * Download ICS file
   */
  function downloadICS(workshop) {
    const icsContent = generateICS(workshop);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workshop.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Render workshop cards
   */
  function renderWorkshopCards(workshops) {
    const container = document.getElementById('workshop-cards');
    if (!container) return;

    container.innerHTML = workshops.map(workshop => `
      <article class="workshop-card reveal" data-workshop-id="${workshop.id}">
        <div class="workshop-card-image" style="background-image: url('${workshop.image}')" role="img" aria-label="${workshop.topic}">
          <span class="workshop-price">${workshop.price}</span>
        </div>
        <div class="workshop-card-content">
          <h3>${workshop.title}</h3>
          <p class="workshop-topic">${workshop.topic}</p>
          <div class="workshop-meta">
            <p class="workshop-date">📅 ${formatDate(workshop.startDate)}</p>
            <p class="workshop-time">🕐 ${formatTime(workshop.startDate)} – ${formatTime(workshop.endDate)}</p>
            <p class="workshop-location">📍 ${workshop.location}</p>
            <p class="workshop-capacity">👥 Capacity: ${workshop.capacity}</p>
          </div>
          <div class="workshop-actions">
            <button class="btn primary signup-btn" data-workshop="${workshop.title}" aria-label="Sign up for ${workshop.title}">Sign Up</button>
            <button class="btn ghost ics-btn" data-week="${workshop.week}" aria-label="Download calendar for ${workshop.title}">📆 Add to Calendar</button>
          </div>
        </div>
      </article>
    `).join('');

    // Re-observe reveal elements
    const revealEls = container.querySelectorAll('.reveal');
    if (revealEls.length && typeof IntersectionObserver !== 'undefined') {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(el => obs.observe(el));
    }

    // Lazy load images
    lazyLoadImages();
  }

  /**
   * Render calendar list view
   */
  function renderCalendarList(workshops, filterMonth = 'all') {
    const container = document.getElementById('calendar-list');
    if (!container) return;

    let filteredWorkshops = workshops;
    if (filterMonth !== 'all') {
      filteredWorkshops = workshops.filter(w => {
        const monthKey = `${w.startDate.getUTCFullYear()}-${String(w.startDate.getUTCMonth() + 1).padStart(2, '0')}`;
        return monthKey === filterMonth;
      });
    }

    container.innerHTML = filteredWorkshops.map(workshop => `
      <div class="calendar-item" data-workshop-id="${workshop.id}">
        <div class="calendar-date">
          <span class="calendar-day">${workshop.startDate.getUTCDate()}</span>
          <span class="calendar-month">${workshop.startDate.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })}</span>
        </div>
        <div class="calendar-details">
          <h4>${workshop.title}</h4>
          <p>${workshop.topic}</p>
          <p class="calendar-time">${formatTime(workshop.startDate)} – ${formatTime(workshop.endDate)} | ${workshop.location}</p>
        </div>
        <div class="calendar-actions">
          <button class="btn ghost ics-btn" data-week="${workshop.week}" aria-label="Download calendar for ${workshop.title}">📆 .ics</button>
          <button class="btn primary signup-btn" data-workshop="${workshop.title}">Sign Up</button>
        </div>
      </div>
    `).join('');

    if (filteredWorkshops.length === 0) {
      container.innerHTML = '<p class="no-results">No workshops found for the selected month.</p>';
    }
  }

  /**
   * Populate month filter dropdown
   */
  function populateMonthFilter(workshops) {
    const select = document.getElementById('month-filter');
    if (!select) return;

    const months = new Map();
    workshops.forEach(w => {
      const monthKey = `${w.startDate.getUTCFullYear()}-${String(w.startDate.getUTCMonth() + 1).padStart(2, '0')}`;
      const monthName = w.startDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
      if (!months.has(monthKey)) {
        months.set(monthKey, monthName);
      }
    });

    months.forEach((name, key) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = name;
      select.appendChild(option);
    });
  }

  /**
   * Lazy load workshop images
   */
  function lazyLoadImages() {
    const images = document.querySelectorAll('.workshop-card-image');
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.style.backgroundImage = img.style.backgroundImage; // Force load
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      });
      images.forEach(img => imageObserver.observe(img));
    }
  }

  // ============ Modal functionality ============

  const modal = document.getElementById('signup-modal');
  const modalContent = modal ? modal.querySelector('.modal-content') : null;
  const closeBtn = modal ? modal.querySelector('.modal-close') : null;
  const form = document.getElementById('workshop-signup-form');
  const workshopField = document.getElementById('workshop-field');
  const modalWorkshopName = document.getElementById('modal-workshop-name');
  let lastFocusedElement = null;

  /**
   * Open signup modal
   */
  function openModal(workshopTitle) {
    if (!modal) return;

    lastFocusedElement = document.activeElement;
    
    if (workshopField) workshopField.value = workshopTitle;
    if (modalWorkshopName) modalWorkshopName.textContent = workshopTitle;
    
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    const firstInput = modal.querySelector('input:not([type="hidden"])');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 50);
    }

    // Trap focus within modal
    modal.addEventListener('keydown', trapFocus);
  }

  /**
   * Close signup modal
   */
  function closeModal() {
    if (!modal) return;

    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Reset form
    if (form) form.reset();
    clearErrors();
    
    // Restore focus
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }

    modal.removeEventListener('keydown', trapFocus);
  }

  /**
   * Trap focus within modal for accessibility
   */
  function trapFocus(e) {
    if (e.key !== 'Tab') return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }

  /**
   * Clear form errors
   */
  function clearErrors() {
    const errors = modal ? modal.querySelectorAll('.error') : [];
    errors.forEach(el => el.textContent = '');
    const msg = document.getElementById('modal-form-message');
    if (msg) msg.textContent = '';
  }

  /**
   * Validate and submit form via AJAX
   */
  async function handleFormSubmit(e) {
    e.preventDefault();
    clearErrors();

    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const fm = document.getElementById('modal-form-message');
    let hasError = false;

    const setErr = (el, txt) => {
      const node = document.getElementById(el.id + '-error');
      if (node) node.textContent = txt;
      hasError = true;
    };

    // Validate name
    if (!nameInput.value.trim()) {
      setErr(nameInput, 'Please enter your name.');
    }

    // Validate email
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      setErr(emailInput, 'Please enter your email.');
    } else if (!emailRx.test(emailInput.value.trim())) {
      setErr(emailInput, 'Please enter a valid email address.');
    }

    if (hasError) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing up...';
    }

    try {
      const endpoint = 'https://formspree.io/f/mzzngobl';
      const data = new FormData(form);
      const res = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        if (fm) {
          fm.style.color = 'green';
          fm.textContent = 'Thanks — you\'re signed up!';
        }
        // Close modal after short delay
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        const body = await res.json().catch(() => ({}));
        if (fm) {
          fm.style.color = 'crimson';
          fm.textContent = body.error || 'Sorry — there was a problem with your signup.';
        }
      }
    } catch (err) {
      if (fm) {
        fm.style.color = 'crimson';
        fm.textContent = 'Network error — please try again later.';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
      }
    }
  }

  // ============ Event Listeners ============

  // Generate and render workshops
  const workshops = generateWorkshops();
  renderWorkshopCards(workshops);
  renderCalendarList(workshops);
  populateMonthFilter(workshops);

  // Month filter change
  const monthFilter = document.getElementById('month-filter');
  if (monthFilter) {
    monthFilter.addEventListener('change', (e) => {
      renderCalendarList(workshops, e.target.value);
    });
  }

  // Delegate click events for signup and ICS buttons
  document.addEventListener('click', (e) => {
    // Sign up button
    if (e.target.classList.contains('signup-btn')) {
      const workshopTitle = e.target.dataset.workshop;
      openModal(workshopTitle);
    }

    // ICS download button
    if (e.target.classList.contains('ics-btn')) {
      const week = parseInt(e.target.dataset.week, 10);
      const workshop = workshops.find(w => w.week === week);
      if (workshop) {
        downloadICS(workshop);
      }
    }
  });

  // Modal close button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Close modal on backdrop click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) {
      closeModal();
    }
  });

  // Form submission
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
});
