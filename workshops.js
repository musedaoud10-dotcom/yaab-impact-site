// ===========================================
// YAAB Impact - Workshops & Calendar System
// ===========================================

(function() {
  'use strict';

  // -------------------------
  // Workshop Data Generation
  // -------------------------
  
  // Get the next upcoming Saturday at 10:00 UTC
  function getNextSaturday() {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7; // If today is Saturday, get next Saturday
    const nextSat = new Date(now);
    nextSat.setUTCDate(now.getUTCDate() + daysUntilSaturday);
    nextSat.setUTCHours(10, 0, 0, 0);
    return nextSat;
  }

  // Workshop titles and descriptions
  const workshopTopics = [
    { title: 'Introduction to Impact Measurement', description: 'Learn the fundamentals of measuring social impact and creating meaningful metrics for your organisation.' },
    { title: 'Grant Writing Essentials', description: 'Master the art of writing compelling grant proposals that resonate with funders and secure funding.' },
    { title: 'Theory of Change Workshop', description: 'Develop a clear theory of change to map your organisation\'s path from activities to outcomes.' },
    { title: 'Stakeholder Engagement Strategies', description: 'Discover effective techniques for engaging stakeholders and building lasting partnerships.' },
    { title: 'Data Collection Methods', description: 'Explore various data collection methods and choose the right approach for your programmes.' },
    { title: 'Storytelling for Impact', description: 'Learn to tell compelling stories that communicate your impact and inspire action.' },
    { title: 'Programme Design Fundamentals', description: 'Design effective programmes with clear objectives, activities, and measurable outcomes.' },
    { title: 'Monitoring & Evaluation Basics', description: 'Build robust M&E frameworks to track progress and demonstrate results.' },
    { title: 'Fundraising Strategy Development', description: 'Create a comprehensive fundraising strategy that diversifies your income streams.' },
    { title: 'Logical Framework Approach', description: 'Master the logframe methodology for planning and managing development projects.' },
    { title: 'Impact Reporting Best Practices', description: 'Learn to create impactful reports that satisfy funders and inspire stakeholders.' },
    { title: 'Sustainability Planning', description: 'Develop strategies for long-term sustainability and organisational resilience.' }
  ];

  // Generate 12 weekly workshops
  function generateWorkshops() {
    const workshops = [];
    const startDate = getNextSaturday();
    
    for (let i = 0; i < 12; i++) {
      const workshopDate = new Date(startDate);
      workshopDate.setUTCDate(startDate.getUTCDate() + (i * 7));
      
      const topic = workshopTopics[i % workshopTopics.length];
      const imageNum = (i % 6) + 1;
      
      workshops.push({
        id: i + 1,
        title: topic.title,
        description: topic.description,
        date: workshopDate,
        time: '10:00 UTC',
        location: 'Community Hub',
        capacity: 10,
        price: 'Free',
        image: `assets/workshop-bg/img${imageNum}.svg`
      });
    }
    
    return workshops;
  }

  // -------------------------
  // Date Formatting Utilities
  // -------------------------
  
  function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  }

  function formatShortDate(date) {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  function getMonthYear(date) {
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }

  function getDay(date) {
    return date.getUTCDate();
  }

  function getMonthShort(date) {
    return date.toLocaleDateString('en-GB', { month: 'short' });
  }

  // -------------------------
  // ICS File Generation
  // -------------------------
  
  function generateICS(workshop) {
    const startDate = workshop.date;
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
    
    function formatICSDate(date) {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
    
    const uid = `workshop-${workshop.id}-${startDate.getTime()}@yaabimpact.org.uk`;
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//YAAB Impact//Workshops//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${workshop.title}`,
      `DESCRIPTION:${workshop.description.replace(/,/g, '\\,')}\\n\\nLocation: ${workshop.location}\\nCapacity: ${workshop.capacity} attendees\\nPrice: ${workshop.price}`,
      `LOCATION:${workshop.location}`,
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
    link.download = `yaab-workshop-${workshop.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // -------------------------
  // Workshop Card Rendering
  // -------------------------
  
  function createWorkshopCard(workshop) {
    const card = document.createElement('article');
    card.className = 'workshop-card reveal';
    card.dataset.month = workshop.date.getUTCMonth();
    
    card.innerHTML = `
      <div class="workshop-card-image">
        <img src="${workshop.image}" alt="${workshop.title}" loading="lazy">
        <span class="workshop-card-badge">${workshop.price}</span>
      </div>
      <div class="workshop-card-content">
        <h3>${workshop.title}</h3>
        <div class="workshop-card-meta">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            ${formatDate(workshop.date)}
          </span>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ${workshop.time}
          </span>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            ${workshop.location}
          </span>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            ${workshop.capacity} spots
          </span>
        </div>
        <p class="workshop-card-description">${workshop.description}</p>
        <div class="workshop-card-actions">
          <button class="btn primary signup-btn" data-workshop-id="${workshop.id}">Sign Up</button>
          <button class="btn secondary ics-btn" data-workshop-id="${workshop.id}">Add to Calendar</button>
        </div>
      </div>
    `;
    
    return card;
  }

  function createWorkshopListItem(workshop) {
    const item = document.createElement('div');
    item.className = 'workshop-list-item';
    item.dataset.month = workshop.date.getUTCMonth();
    
    item.innerHTML = `
      <div class="workshop-list-date">
        <span class="day">${getDay(workshop.date)}</span>
        <span class="month">${getMonthShort(workshop.date)}</span>
      </div>
      <div class="workshop-list-info">
        <h4>${workshop.title}</h4>
        <p>${workshop.time} • ${workshop.location} • ${workshop.capacity} spots • ${workshop.price}</p>
      </div>
      <div class="workshop-list-actions">
        <button class="btn primary signup-btn" data-workshop-id="${workshop.id}">Sign Up</button>
        <button class="btn secondary ics-btn" data-workshop-id="${workshop.id}">📅</button>
      </div>
    `;
    
    return item;
  }

  // -------------------------
  // Signup Modal
  // -------------------------
  
  function createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'signup-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');
    
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 id="modal-title">Workshop Sign Up</h2>
          <button class="modal-close" aria-label="Close modal">&times;</button>
        </div>
        <form id="workshop-signup-form" novalidate>
          <div class="modal-body">
            <input type="hidden" name="workshop" id="workshop-name">
            <div class="form-row">
              <label for="signup-name">Name <span aria-hidden="true">*</span></label>
              <input type="text" id="signup-name" name="name" required aria-required="true">
              <span class="error" id="signup-name-error" aria-live="polite"></span>
            </div>
            <div class="form-row">
              <label for="signup-email">Email <span aria-hidden="true">*</span></label>
              <input type="email" id="signup-email" name="_replyto" required aria-required="true">
              <span class="error" id="signup-email-error" aria-live="polite"></span>
            </div>
            <div class="form-row">
              <label for="signup-message">Message (optional)</label>
              <textarea id="signup-message" name="message" rows="3" placeholder="Any questions or special requirements?"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="submit" class="btn primary">Register for Workshop</button>
            <p id="signup-form-message" class="form-message" role="status" aria-live="polite"></p>
          </div>
        </form>
        <div class="modal-success" style="display: none;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3>Registration Complete!</h3>
          <p>Thank you for signing up. We'll send you a confirmation email shortly.</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
  }

  let currentWorkshop = null;
  let modalElement = null;
  let previousActiveElement = null;

  function openModal(workshop) {
    currentWorkshop = workshop;
    previousActiveElement = document.activeElement;
    
    if (!modalElement) {
      modalElement = createModal();
      setupModalEvents();
    }
    
    // Update modal content
    document.getElementById('modal-title').textContent = `Sign Up: ${workshop.title}`;
    document.getElementById('workshop-name').value = workshop.title;
    
    // Reset form
    const form = document.getElementById('workshop-signup-form');
    const successDiv = modalElement.querySelector('.modal-success');
    form.style.display = 'block';
    successDiv.style.display = 'none';
    form.reset();
    clearErrors();
    
    // Show modal
    modalElement.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    setTimeout(() => {
      document.getElementById('signup-name').focus();
    }, 100);
  }

  function closeModal() {
    if (modalElement) {
      modalElement.classList.remove('active');
      document.body.style.overflow = '';
      
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    }
  }

  function clearErrors() {
    const errors = modalElement.querySelectorAll('.error');
    errors.forEach(el => el.textContent = '');
    const formMessage = document.getElementById('signup-form-message');
    if (formMessage) formMessage.textContent = '';
  }

  function setupModalEvents() {
    const closeBtn = modalElement.querySelector('.modal-close');
    const form = document.getElementById('workshop-signup-form');
    
    // Close button
    closeBtn.addEventListener('click', closeModal);
    
    // Backdrop click
    modalElement.addEventListener('click', (e) => {
      if (e.target === modalElement) {
        closeModal();
      }
    });
    
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalElement.classList.contains('active')) {
        closeModal();
      }
    });
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Trap focus within modal
    modalElement.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        trapFocus(e);
      }
    });
  }

  function trapFocus(e) {
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    clearErrors();
    
    const name = document.getElementById('signup-name');
    const email = document.getElementById('signup-email');
    const message = document.getElementById('signup-message');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const formMessage = document.getElementById('signup-form-message');
    
    let hasError = false;
    
    // Validation (reusing pattern from script.js)
    if (!name.value.trim()) {
      document.getElementById('signup-name-error').textContent = 'Please enter your name.';
      hasError = true;
    }
    
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      document.getElementById('signup-email-error').textContent = 'Please enter your email.';
      hasError = true;
    } else if (!emailRx.test(email.value.trim())) {
      document.getElementById('signup-email-error').textContent = 'Please enter a valid email address.';
      hasError = true;
    }
    
    if (hasError) return;
    
    // Submit to Formspree
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';
    
    try {
      const formData = new FormData(e.target);
      formData.append('_subject', `Workshop Registration: ${currentWorkshop.title}`);
      
      const response = await fetch('https://formspree.io/f/mzzngobl', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        // Show success state
        const form = document.getElementById('workshop-signup-form');
        const successDiv = modalElement.querySelector('.modal-success');
        form.style.display = 'none';
        successDiv.style.display = 'block';
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          closeModal();
        }, 3000);
      } else {
        const data = await response.json().catch(() => ({}));
        formMessage.style.color = 'crimson';
        formMessage.textContent = data.error || 'Sorry — there was a problem with your registration.';
      }
    } catch (err) {
      formMessage.style.color = 'crimson';
      formMessage.textContent = 'Network error — please try again later.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register for Workshop';
    }
  }

  // -------------------------
  // View Toggle & Month Filter
  // -------------------------
  
  function setupViewToggle(workshops) {
    const gridBtn = document.getElementById('view-grid');
    const listBtn = document.getElementById('view-list');
    const gridContainer = document.getElementById('workshops-grid');
    const listContainer = document.getElementById('workshops-list');
    
    if (!gridBtn || !listBtn) return;
    
    gridBtn.addEventListener('click', () => {
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
      gridContainer.classList.add('active');
      listContainer.classList.remove('active');
    });
    
    listBtn.addEventListener('click', () => {
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
      listContainer.classList.add('active');
      gridContainer.classList.remove('active');
    });
  }

  function setupMonthFilter(workshops) {
    const filterSelect = document.getElementById('month-filter');
    if (!filterSelect) return;
    
    // Get unique months from workshops
    const months = [...new Set(workshops.map(w => {
      return w.date.getUTCMonth() + '-' + w.date.getUTCFullYear();
    }))];
    
    // Populate filter options
    months.forEach(monthKey => {
      const [month, year] = monthKey.split('-');
      const date = new Date(year, month, 1);
      const option = document.createElement('option');
      option.value = monthKey;
      option.textContent = getMonthYear(date);
      filterSelect.appendChild(option);
    });
    
    // Filter functionality
    filterSelect.addEventListener('change', () => {
      const selectedValue = filterSelect.value;
      const gridCards = document.querySelectorAll('#workshops-grid .workshop-card');
      const listItems = document.querySelectorAll('#workshops-list .workshop-list-item');
      
      [...gridCards, ...listItems].forEach(item => {
        if (selectedValue === 'all') {
          item.style.display = '';
        } else {
          const [month, year] = selectedValue.split('-');
          const itemMonth = parseInt(item.dataset.month);
          const workshop = workshops.find(w => 
            w.date.getUTCMonth() === itemMonth && 
            w.date.getUTCFullYear() === parseInt(year)
          );
          
          if (itemMonth === parseInt(month)) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        }
      });
    });
  }

  // -------------------------
  // Initialize Workshops Page
  // -------------------------
  
  function initWorkshopsPage() {
    const gridContainer = document.getElementById('workshops-grid');
    const listContainer = document.getElementById('workshops-list');
    
    if (!gridContainer && !listContainer) return;
    
    const workshops = generateWorkshops();
    
    // Render grid view
    if (gridContainer) {
      workshops.forEach(workshop => {
        gridContainer.appendChild(createWorkshopCard(workshop));
      });
    }
    
    // Render list view
    if (listContainer) {
      workshops.forEach(workshop => {
        listContainer.appendChild(createWorkshopListItem(workshop));
      });
    }
    
    // Setup view toggle
    setupViewToggle(workshops);
    
    // Setup month filter
    setupMonthFilter(workshops);
    
    // Event delegation for buttons
    document.addEventListener('click', (e) => {
      // Sign up button
      if (e.target.classList.contains('signup-btn')) {
        const workshopId = parseInt(e.target.dataset.workshopId);
        const workshop = workshops.find(w => w.id === workshopId);
        if (workshop) {
          openModal(workshop);
        }
      }
      
      // ICS download button
      if (e.target.classList.contains('ics-btn')) {
        const workshopId = parseInt(e.target.dataset.workshopId);
        const workshop = workshops.find(w => w.id === workshopId);
        if (workshop) {
          downloadICS(workshop);
        }
      }
    });
    
    // Re-run reveal animation for dynamically added elements
    const revealEls = document.querySelectorAll('.reveal:not(.revealed)');
    if (revealEls.length) {
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
  }

  // -------------------------
  // Initialize Homepage Preview
  // -------------------------
  
  function initHomepageWorkshops() {
    const previewContainer = document.getElementById('workshops-preview');
    if (!previewContainer) return;
    
    const workshops = generateWorkshops().slice(0, 3); // Show only 3 on homepage
    
    workshops.forEach(workshop => {
      previewContainer.appendChild(createWorkshopCard(workshop));
    });
    
    // Event delegation for preview cards
    previewContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('signup-btn')) {
        const workshopId = parseInt(e.target.dataset.workshopId);
        const workshop = generateWorkshops().find(w => w.id === workshopId);
        if (workshop) {
          openModal(workshop);
        }
      }
      
      if (e.target.classList.contains('ics-btn')) {
        const workshopId = parseInt(e.target.dataset.workshopId);
        const workshop = generateWorkshops().find(w => w.id === workshopId);
        if (workshop) {
          downloadICS(workshop);
        }
      }
    });
  }

  // -------------------------
  // DOMContentLoaded
  // -------------------------
  
  document.addEventListener('DOMContentLoaded', () => {
    initWorkshopsPage();
    initHomepageWorkshops();
  });

  // Export for testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateWorkshops, generateICS };
  }

})();
