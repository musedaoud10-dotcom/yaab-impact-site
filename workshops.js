// Workshops page functionality:
// - Auto-generate 12 weekly workshops
// - Modal signup form with AJAX submission
// - Calendar (.ics) download
// - View toggle (grid/list)
// - Month filter

(function() {
  'use strict';

  // ============================================
  // CONSTANTS
  // ============================================
  
  const MODAL_FOCUS_DELAY_MS = 100;
  const SUCCESS_AUTO_CLOSE_DELAY_MS = 4000; // 4 seconds for accessibility

  // ============================================
  // WORKSHOP DATA GENERATION
  // ============================================
  
  /**
   * Get the next upcoming Saturday at 10:00 UTC
   * @returns {Date}
   */
  function getNextSaturday() {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7; // If today is Saturday, get next Saturday
    
    const nextSat = new Date(now);
    nextSat.setUTCDate(now.getUTCDate() + daysUntilSaturday);
    nextSat.setUTCHours(10, 0, 0, 0);
    
    return nextSat;
  }

  /**
   * Generate 12 weekly workshop events
   * @returns {Array}
   */
  function generateWorkshops() {
    const workshops = [];
    const startDate = getNextSaturday();
    const images = [
      'assets/workshop-bg/img1.svg',
      'assets/workshop-bg/img2.svg',
      'assets/workshop-bg/img3.svg',
      'assets/workshop-bg/img4.svg',
      'assets/workshop-bg/img5.svg',
      'assets/workshop-bg/img6.svg'
    ];

    for (let i = 0; i < 12; i++) {
      const eventDate = new Date(startDate);
      eventDate.setUTCDate(startDate.getUTCDate() + (i * 7));
      
      workshops.push({
        id: i + 1,
        title: `Economical Cooking — Week ${i + 1}`,
        description: 'Learn practical tips and techniques for preparing nutritious, budget-friendly meals. This hands-on workshop covers meal planning, smart shopping, and delicious recipes that won\'t break the bank.',
        excerpt: 'Learn practical tips for preparing nutritious, budget-friendly meals in this hands-on workshop.',
        date: eventDate,
        location: 'Community Hub',
        capacity: 10,
        price: 'Free',
        duration: 2, // hours
        image: images[i % 6]
      });
    }

    return workshops;
  }

  // ============================================
  // DATE FORMATTING HELPERS
  // ============================================

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function formatDate(date) {
    return `${dayNames[date.getUTCDay()]}, ${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
  }

  function formatTime(date) {
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${ampm} UTC`;
  }

  function formatDateShort(date) {
    return `${monthNamesShort[date.getUTCMonth()]} ${date.getUTCDate()}`;
  }

  // ============================================
  // ICS CALENDAR GENERATION
  // ============================================

  function padZero(num) {
    return num.toString().padStart(2, '0');
  }

  function formatICSDate(date) {
    return `${date.getUTCFullYear()}${padZero(date.getUTCMonth() + 1)}${padZero(date.getUTCDate())}T${padZero(date.getUTCHours())}${padZero(date.getUTCMinutes())}00Z`;
  }

  function generateICS(workshop) {
    const startDate = workshop.date;
    const endDate = new Date(startDate);
    endDate.setUTCHours(endDate.getUTCHours() + workshop.duration);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//YAAB Impact//Workshops//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${workshop.title}`,
      `DESCRIPTION:${workshop.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${workshop.location}`,
      `UID:workshop-${workshop.id}@yaabimpact.org.uk`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  }

  function downloadICS(workshop) {
    const icsContent = generateICS(workshop);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `workshop-week-${workshop.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  function renderWorkshopCard(workshop) {
    return `
      <article class="workshop-card" data-month="${workshop.date.getUTCMonth()}" data-workshop-id="${workshop.id}">
        <img 
          class="workshop-card-image" 
          src="${workshop.image}" 
          alt="Workshop background" 
          loading="lazy"
        >
        <div class="workshop-card-content">
          <h3 class="workshop-card-title">${workshop.title}</h3>
          <div class="workshop-card-meta">
            <span>
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              ${formatDate(workshop.date)}
            </span>
            <span>
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
              ${formatTime(workshop.date)} (${workshop.duration}h)
            </span>
            <span>
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              ${workshop.location}
            </span>
          </div>
          <p class="workshop-card-excerpt">${workshop.excerpt}</p>
          <div class="workshop-card-footer">
            <span class="workshop-card-price">${workshop.price}</span>
            <span class="workshop-card-capacity">Capacity: ${workshop.capacity}</span>
          </div>
          <div class="workshop-card-actions">
            <button class="btn-signup" data-workshop-id="${workshop.id}" aria-label="Sign up for ${workshop.title}">Sign up</button>
            <button class="btn-calendar" data-workshop-id="${workshop.id}" aria-label="Add ${workshop.title} to calendar">Add to calendar</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderWorkshopListItem(workshop) {
    return `
      <div class="workshop-list-item" data-month="${workshop.date.getUTCMonth()}" data-workshop-id="${workshop.id}">
        <div class="workshop-list-date">
          <span class="day">${workshop.date.getUTCDate()}</span>
          <span class="month">${monthNamesShort[workshop.date.getUTCMonth()]}</span>
        </div>
        <div class="workshop-list-info">
          <h3 class="workshop-list-title">${workshop.title}</h3>
          <p class="workshop-list-meta">${formatTime(workshop.date)} · ${workshop.location} · ${workshop.price}</p>
        </div>
        <div class="workshop-list-actions">
          <button class="btn-signup" data-workshop-id="${workshop.id}" aria-label="Sign up for ${workshop.title}">Sign up</button>
          <button class="btn-calendar" data-workshop-id="${workshop.id}" aria-label="Add ${workshop.title} to calendar">📅</button>
        </div>
      </div>
    `;
  }

  function renderMonthFilters(workshops) {
    const months = new Set();
    workshops.forEach(w => months.add(w.date.getUTCMonth()));
    
    let html = '<button class="month-filter-btn active" data-month="all">All</button>';
    Array.from(months).sort((a, b) => a - b).forEach(month => {
      html += `<button class="month-filter-btn" data-month="${month}">${monthNamesShort[month]}</button>`;
    });
    
    return html;
  }

  // ============================================
  // MODAL FUNCTIONALITY
  // ============================================

  let currentWorkshop = null;

  function createModal() {
    const modalHTML = `
      <div class="modal-overlay" id="signup-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal" role="document">
          <div class="modal-header">
            <h2 class="modal-title" id="modal-title">Sign Up for Workshop</h2>
            <button class="modal-close" aria-label="Close modal">&times;</button>
          </div>
          <div class="modal-body">
            <form id="workshop-signup-form" class="modal-form" novalidate>
              <input type="hidden" name="workshop_title" id="workshop-title-field">
              
              <div class="form-group">
                <label for="signup-name">Name <span class="required" aria-hidden="true">*</span></label>
                <input type="text" id="signup-name" name="name" required aria-required="true" autocomplete="name">
                <span class="error-message" id="name-error" role="alert" aria-live="polite"></span>
              </div>
              
              <div class="form-group">
                <label for="signup-email">Email <span class="required" aria-hidden="true">*</span></label>
                <input type="email" id="signup-email" name="_replyto" required aria-required="true" autocomplete="email">
                <span class="error-message" id="email-error" role="alert" aria-live="polite"></span>
              </div>
              
              <div class="form-group">
                <label for="signup-message">Message (optional)</label>
                <textarea id="signup-message" name="message" rows="3" placeholder="Any questions or dietary requirements?"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="submit" form="workshop-signup-form" class="modal-submit">Submit Registration</button>
            <div id="modal-error" class="modal-error" role="alert" aria-live="polite" style="display: none;"></div>
          </div>
          
          <div class="modal-success" id="signup-success" style="display: none;">
            <div class="modal-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            </div>
            <h3>Registration Submitted!</h3>
            <p>We'll send you a confirmation email shortly.</p>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  function openModal(workshop) {
    currentWorkshop = workshop;
    const modal = document.getElementById('signup-modal');
    const form = document.getElementById('workshop-signup-form');
    const titleField = document.getElementById('workshop-title-field');
    const modalTitle = document.getElementById('modal-title');
    const successDiv = document.getElementById('signup-success');
    const formElements = modal.querySelectorAll('.modal-body, .modal-footer');
    const errorDiv = document.getElementById('modal-error');
    
    // Reset form state
    form.reset();
    clearFormErrors();
    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.style.display = 'none';
    }
    titleField.value = workshop.title;
    modalTitle.textContent = `Sign Up: ${workshop.title}`;
    
    // Show form, hide success
    formElements.forEach(el => el.style.display = '');
    successDiv.style.display = 'none';
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    setTimeout(() => {
      document.getElementById('signup-name').focus();
    }, MODAL_FOCUS_DELAY_MS);
  }

  function closeModal() {
    const modal = document.getElementById('signup-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentWorkshop = null;
  }

  function showSuccess() {
    const modal = document.getElementById('signup-modal');
    const successDiv = document.getElementById('signup-success');
    const formElements = modal.querySelectorAll('.modal-body, .modal-footer');
    
    formElements.forEach(el => el.style.display = 'none');
    successDiv.style.display = 'block';
    
    // Auto-close after delay (longer for accessibility)
    setTimeout(() => {
      closeModal();
    }, SUCCESS_AUTO_CLOSE_DELAY_MS);
  }

  // ============================================
  // FORM VALIDATION (reusing existing patterns)
  // ============================================

  function clearFormErrors() {
    document.querySelectorAll('.form-group.has-error').forEach(el => {
      el.classList.remove('has-error');
    });
    document.querySelectorAll('.error-message').forEach(el => {
      el.textContent = '';
      el.classList.remove('visible');
    });
  }

  function setError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId.replace('signup-', '') + '-error');
    
    if (field && errorEl) {
      field.parentElement.classList.add('has-error');
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function validateForm() {
    clearFormErrors();
    let isValid = true;
    
    const name = document.getElementById('signup-name');
    const email = document.getElementById('signup-email');
    
    if (!name.value.trim()) {
      setError('signup-name', 'Please enter your name.');
      isValid = false;
    }
    
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      setError('signup-email', 'Please enter your email.');
      isValid = false;
    } else if (!emailRx.test(email.value.trim())) {
      setError('signup-email', 'Please enter a valid email address.');
      isValid = false;
    }
    
    return isValid;
  }

  // ============================================
  // AJAX FORM SUBMISSION
  // ============================================

  function showModalError(message) {
    const errorDiv = document.getElementById('modal-error');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  }

  function hideModalError() {
    const errorDiv = document.getElementById('modal-error');
    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.style.display = 'none';
    }
  }

  async function submitForm(form) {
    const submitBtn = document.querySelector('.modal-submit');
    const originalText = submitBtn.textContent;
    
    hideModalError();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
      const formData = new FormData(form);
      const response = await fetch('https://formspree.io/f/mzzngobl', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        showSuccess();
      } else {
        const data = await response.json().catch(() => ({}));
        showModalError(data.error || 'Sorry, there was a problem submitting your registration. Please try again.');
      }
    } catch (error) {
      showModalError('Network error. Please check your connection and try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  // ============================================
  // VIEW TOGGLE & FILTER
  // ============================================

  function filterByMonth(month) {
    const cards = document.querySelectorAll('.workshop-card');
    const listItems = document.querySelectorAll('.workshop-list-item');
    
    [...cards, ...listItems].forEach(item => {
      if (month === 'all' || item.dataset.month === String(month)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }

  function toggleView(view) {
    const gridContainer = document.getElementById('workshops-grid');
    const listContainer = document.getElementById('workshops-list');
    const gridBtn = document.querySelector('[data-view="grid"]');
    const listBtn = document.querySelector('[data-view="list"]');
    
    if (view === 'grid') {
      gridContainer.classList.remove('hidden');
      listContainer.classList.remove('active');
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
    } else {
      gridContainer.classList.add('hidden');
      listContainer.classList.add('active');
      gridBtn.classList.remove('active');
      listBtn.classList.add('active');
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    // Generate workshops
    const workshops = generateWorkshops();
    window.workshopsData = workshops; // Store for reference
    
    // Render grid view
    const gridContainer = document.getElementById('workshops-grid');
    if (gridContainer) {
      gridContainer.innerHTML = workshops.map(renderWorkshopCard).join('');
    }
    
    // Render list view
    const listContainer = document.getElementById('workshops-list');
    if (listContainer) {
      listContainer.innerHTML = workshops.map(renderWorkshopListItem).join('');
    }
    
    // Render month filters
    const filterContainer = document.getElementById('month-filter');
    if (filterContainer) {
      filterContainer.innerHTML = renderMonthFilters(workshops);
    }
    
    // Create modal
    createModal();
    
    // Event delegation for signup buttons
    document.addEventListener('click', (e) => {
      // Sign up button
      if (e.target.classList.contains('btn-signup')) {
        const workshopId = parseInt(e.target.dataset.workshopId, 10);
        const workshop = workshops.find(w => w.id === workshopId);
        if (workshop) {
          openModal(workshop);
        }
      }
      
      // Calendar button
      if (e.target.classList.contains('btn-calendar')) {
        const workshopId = parseInt(e.target.dataset.workshopId, 10);
        const workshop = workshops.find(w => w.id === workshopId);
        if (workshop) {
          downloadICS(workshop);
        }
      }
      
      // Modal close button
      if (e.target.classList.contains('modal-close')) {
        closeModal();
      }
      
      // Backdrop close
      if (e.target.classList.contains('modal-overlay')) {
        closeModal();
      }
      
      // View toggle
      if (e.target.classList.contains('view-toggle-btn')) {
        toggleView(e.target.dataset.view);
      }
      
      // Month filter
      if (e.target.classList.contains('month-filter-btn')) {
        document.querySelectorAll('.month-filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        filterByMonth(e.target.dataset.month);
      }
    });
    
    // Form submission
    const form = document.getElementById('workshop-signup-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm()) {
          submitForm(form);
        }
      });
    }
    
    // Keyboard accessibility - close modal on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('signup-modal');
        if (modal && modal.classList.contains('active')) {
          closeModal();
        }
      }
    });
    
    // Trap focus in modal
    const modal = document.getElementById('signup-modal');
    if (modal) {
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          const focusable = modal.querySelectorAll('button, input, textarea, [tabindex]:not([tabindex="-1"])');
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
