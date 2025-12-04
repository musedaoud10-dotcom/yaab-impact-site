// Mobile nav toggle, smooth scroll, reveal animations, form validation + AJAX (Formspree),
// Workshop calendar generation, ICS export, and modal signup

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('show');
    });
  }

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const href = link.getAttribute('href');
    // allow normal behaviour for '#' or external links
    if (href && href.length > 1) {
      link.addEventListener('click', (e) => {
        const target = document.getElementById(href.slice(1));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (nav && nav.classList.contains('show')) {
            nav.classList.remove('show');
            menuToggle.setAttribute('aria-expanded', 'false');
          }
        }
      });
    }
  });

  // IntersectionObserver reveal
  const revealEls = document.querySelectorAll('.reveal');
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

  // Form validation + AJAX submit (Formspree) for contact form
  const form = document.getElementById('contact-form');
  const fm = document.getElementById('form-message');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (fm) { fm.textContent = ''; fm.style.color = ''; }

      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const message = document.getElementById('message');
      let error = false;

      const setErr = (el, txt) => {
        const node = document.getElementById(el.id + '-error');
        if (node) node.textContent = txt;
        error = true;
      };
      const clearErr = (el) => {
        const node = document.getElementById(el.id + '-error');
        if (node) node.textContent = '';
      };

      if (!name.value.trim()) setErr(name, 'Please enter your name.');
      else clearErr(name);

      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim()) setErr(email, 'Please enter your email.');
      else if (!emailRx.test(email.value.trim())) setErr(email, 'Please enter a valid email address.');
      else clearErr(email);

      if (!message.value.trim()) setErr(message, 'Please enter a message.');
      else clearErr(message);

      if (error) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }

      try {
        // Use explicit endpoint with your real Formspree ID
        const endpoint = 'https://formspree.io/f/mzzngobl';
        const data = new FormData(form);
        const res = await fetch(endpoint, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          form.reset();
          if (fm) { fm.style.color = 'green'; fm.textContent = 'Thanks — your message was sent.'; }
        } else {
          const body = await res.json().catch(()=>({}));
          if (fm) { fm.style.color = 'crimson'; fm.textContent = body.error || 'Sorry — there was a problem sending your message.'; }
        }
      } catch (err) {
        if (fm) { fm.style.color = 'crimson'; fm.textContent = 'Network error — please try again later.'; }
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send message'; }
      }
    });
  }

  // ================================
  // WORKSHOP CALENDAR GENERATION
  // ================================
  
  // Workshop data - 12+ weekly entries starting from next Saturday
  const workshopTemplates = [
    { title: 'Introduction to Impact Strategy', description: 'Learn the fundamentals of designing programmes for maximum social impact.' },
    { title: 'Grant Writing Essentials', description: 'Master the art of writing compelling grant proposals that get funded.' },
    { title: 'Sustainable Food Systems', description: 'Explore how to build resilient local food networks in your community.' },
    { title: 'Community Garden Planning', description: 'Hands-on session on planning and maintaining community gardens.' },
    { title: 'Measuring Social Impact', description: 'Learn practical tools for measuring and communicating your impact.' },
    { title: 'Fundraising for Beginners', description: 'Get started with fundraising strategies for social enterprises.' },
    { title: 'Building Partnerships', description: 'Discover how to build effective partnerships with funders and stakeholders.' },
    { title: 'Urban Farming Basics', description: 'Introduction to growing food in urban environments.' },
    { title: 'Programme Design Workshop', description: 'Design your next programme using our proven framework.' },
    { title: 'Storytelling for Impact', description: 'Learn to tell compelling stories that inspire action and funding.' },
    { title: 'Financial Sustainability', description: 'Build a sustainable financial model for your organisation.' },
    { title: 'Community Engagement', description: 'Effective strategies for engaging and mobilising communities.' },
    { title: 'Social Enterprise 101', description: 'Introduction to running a social enterprise.' },
    { title: 'Impact Reporting', description: 'Create reports that showcase your impact to funders and stakeholders.' }
  ];

  const backgroundImages = [
    'assets/workshop-bg/bg-1.svg',
    'assets/workshop-bg/bg-2.svg',
    'assets/workshop-bg/bg-3.svg',
    'assets/workshop-bg/bg-4.svg',
    'assets/workshop-bg/bg-5.svg',
    'assets/workshop-bg/bg-6.svg'
  ];

  // Get next Saturday at 10:00 AM
  function getNextSaturday() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7; // If today is Saturday, get next Saturday
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);
    nextSaturday.setHours(10, 0, 0, 0);
    return nextSaturday;
  }

  // Generate workshop events
  function generateWorkshops(count = 12) {
    const workshops = [];
    let currentDate = getNextSaturday();
    
    for (let i = 0; i < count; i++) {
      const template = workshopTemplates[i % workshopTemplates.length];
      const bgImage = backgroundImages[i % backgroundImages.length];
      
      workshops.push({
        id: `workshop-${i + 1}`,
        title: template.title,
        description: template.description,
        date: new Date(currentDate),
        location: 'Community Hub',
        capacity: 10,
        price: 'Free',
        backgroundImage: bgImage
      });
      
      // Move to next Saturday
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return workshops;
  }

  // Format date for display
  function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  }

  function formatTime(date) {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  // Generate ICS file content
  function generateICS(workshop) {
    const startDate = workshop.date;
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2); // 2-hour workshop

    const formatICSDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YAAB Impact//Workshops//EN
BEGIN:VEVENT
UID:${workshop.id}@yaabimpact.org.uk
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${workshop.title} - YAAB Impact Workshop
DESCRIPTION:${workshop.description}\\n\\nLocation: ${workshop.location}\\nPrice: ${workshop.price}\\nCapacity: ${workshop.capacity} attendees
LOCATION:${workshop.location}
END:VEVENT
END:VCALENDAR`;

    return icsContent;
  }

  // Download ICS file
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

  // Create workshop card HTML
  function createWorkshopCard(workshop) {
    const day = workshop.date.getDate();
    const month = workshop.date.toLocaleString('en-GB', { month: 'short' });
    
    const card = document.createElement('article');
    card.className = 'workshop-card reveal';
    card.innerHTML = `
      <div class="workshop-card-header parallax-bg" style="background-image: url('${workshop.backgroundImage}');" role="img" aria-label="Workshop background">
        <div class="workshop-card-date">
          <span class="day">${day}</span>
          <span class="month">${month}</span>
        </div>
      </div>
      <div class="workshop-card-body">
        <h3>${workshop.title}</h3>
        <p>${workshop.description}</p>
        <div class="workshop-card-meta">
          <span aria-label="Time">🕐 ${formatTime(workshop.date)}</span>
          <span aria-label="Location">📍 ${workshop.location}</span>
          <span aria-label="Price">💰 ${workshop.price}</span>
          <span aria-label="Capacity">👥 ${workshop.capacity} spots</span>
        </div>
        <div class="workshop-card-actions">
          <button class="btn primary signup-btn" data-workshop-id="${workshop.id}" aria-label="Sign up for ${workshop.title}">Sign Up</button>
          <button class="btn secondary ics-btn" data-workshop-id="${workshop.id}" aria-label="Add ${workshop.title} to calendar">Add to Calendar</button>
        </div>
      </div>
    `;
    
    return card;
  }

  // Store workshops globally for access by event handlers
  let allWorkshops = [];

  // Render workshops to calendar grid
  function renderWorkshops(workshops, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (workshops.length === 0) {
      container.innerHTML = '<p class="no-workshops">No workshops found for this period.</p>';
      return;
    }
    
    workshops.forEach(workshop => {
      const card = createWorkshopCard(workshop);
      container.appendChild(card);
    });
    
    // Re-observe for reveal animation
    const revealCards = container.querySelectorAll('.reveal');
    if (revealCards.length) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      revealCards.forEach(el => obs.observe(el));
    }
  }

  // Populate month filter
  function populateMonthFilter(workshops) {
    const filter = document.getElementById('month-filter');
    if (!filter) return;
    
    const months = new Set();
    workshops.forEach(w => {
      const monthYear = w.date.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
      months.add(monthYear);
    });
    
    months.forEach(month => {
      const option = document.createElement('option');
      option.value = month;
      option.textContent = month;
      filter.appendChild(option);
    });
    
    filter.addEventListener('change', () => {
      const value = filter.value;
      if (value === 'all') {
        renderWorkshops(allWorkshops, 'workshop-calendar');
      } else {
        const filtered = allWorkshops.filter(w => {
          const monthYear = w.date.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
          return monthYear === value;
        });
        renderWorkshops(filtered, 'workshop-calendar');
      }
    });
  }

  // Initialize workshop calendar if on workshops page
  const workshopCalendar = document.getElementById('workshop-calendar');
  if (workshopCalendar) {
    allWorkshops = generateWorkshops(14); // Generate 14 weeks of workshops
    renderWorkshops(allWorkshops, 'workshop-calendar');
    populateMonthFilter(allWorkshops);
  }

  // Initialize home page workshop preview
  const homeWorkshops = document.getElementById('home-workshops');
  if (homeWorkshops) {
    // Always populate allWorkshops so modal can find workshop data
    allWorkshops = generateWorkshops(14);
    const previewWorkshops = allWorkshops.slice(0, 3); // Show first 3 workshops
    renderWorkshops(previewWorkshops, 'home-workshops');
  }

  // ================================
  // SIGNUP MODAL
  // ================================
  
  const modal = document.getElementById('signup-modal');
  const signupForm = document.getElementById('workshop-signup-form');
  let focusableElements = [];
  let firstFocusable = null;
  let lastFocusable = null;
  let previousActiveElement = null;
  let currentWorkshop = null;

  function openModal(workshop) {
    if (!modal) return;
    
    currentWorkshop = workshop;
    previousActiveElement = document.activeElement;
    
    // Set workshop details in form
    const workshopName = document.getElementById('modal-workshop-name');
    const workshopIdInput = document.getElementById('workshop-id');
    const workshopTitleInput = document.getElementById('workshop-title');
    const workshopDateInput = document.getElementById('workshop-date');
    
    if (workshopName) workshopName.textContent = `${workshop.title} — ${formatDate(workshop.date)}`;
    if (workshopIdInput) workshopIdInput.value = workshop.id;
    if (workshopTitleInput) workshopTitleInput.value = workshop.title;
    if (workshopDateInput) workshopDateInput.value = workshop.date.toISOString();
    
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Set up focus trap
    focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable = focusableElements[0];
    lastFocusable = focusableElements[focusableElements.length - 1];
    
    // Focus the close button or first input
    setTimeout(() => {
      const nameInput = document.getElementById('signup-name');
      if (nameInput) nameInput.focus();
    }, 100);
  }

  function closeModal() {
    if (!modal) return;
    
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Reset form
    if (signupForm) {
      signupForm.reset();
      const msgEl = document.getElementById('signup-form-message');
      if (msgEl) msgEl.textContent = '';
      // Clear errors
      ['signup-name-error', 'signup-email-error'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
      });
    }
    
    // Return focus
    if (previousActiveElement) {
      previousActiveElement.focus();
    }
  }

  // Handle modal close buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  // Handle Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
    
    // Focus trap
    if (e.key === 'Tab' && modal && modal.getAttribute('aria-hidden') === 'false') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  });

  // Handle signup button clicks (event delegation)
  document.addEventListener('click', (e) => {
    const signupBtn = e.target.closest('.signup-btn');
    if (signupBtn) {
      const workshopId = signupBtn.dataset.workshopId;
      const workshop = allWorkshops.find(w => w.id === workshopId);
      if (workshop) {
        openModal(workshop);
      }
    }
    
    const icsBtn = e.target.closest('.ics-btn');
    if (icsBtn) {
      const workshopId = icsBtn.dataset.workshopId;
      const workshop = allWorkshops.find(w => w.id === workshopId);
      if (workshop) {
        downloadICS(workshop);
      }
    }
  });

  // Workshop signup form validation and submission
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const msgEl = document.getElementById('signup-form-message');
      if (msgEl) { msgEl.textContent = ''; msgEl.style.color = ''; }
      
      const name = document.getElementById('signup-name');
      const email = document.getElementById('signup-email');
      let hasError = false;
      
      const setError = (el, txt) => {
        const errEl = document.getElementById(el.id + '-error');
        if (errEl) errEl.textContent = txt;
        hasError = true;
      };
      const clearError = (el) => {
        const errEl = document.getElementById(el.id + '-error');
        if (errEl) errEl.textContent = '';
      };
      
      // Validate name
      if (!name.value.trim()) {
        setError(name, 'Please enter your name.');
      } else {
        clearError(name);
      }
      
      // Validate email
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim()) {
        setError(email, 'Please enter your email.');
      } else if (!emailRx.test(email.value.trim())) {
        setError(email, 'Please enter a valid email address.');
      } else {
        clearError(email);
      }
      
      if (hasError) return;
      
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Signing up...'; }
      
      try {
        const endpoint = 'https://formspree.io/f/mzzngobl';
        const data = new FormData(signupForm);
        const res = await fetch(endpoint, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        
        if (res.ok) {
          if (msgEl) {
            msgEl.style.color = 'green';
            msgEl.textContent = 'Success! You\'re signed up for this workshop.';
          }
          // Close modal after delay
          setTimeout(() => {
            closeModal();
          }, 2000);
        } else {
          const body = await res.json().catch(() => ({}));
          if (msgEl) {
            msgEl.style.color = 'crimson';
            msgEl.textContent = body.error || 'Sorry — there was a problem with your signup.';
          }
        }
      } catch (err) {
        if (msgEl) {
          msgEl.style.color = 'crimson';
          msgEl.textContent = 'Network error — please try again later.';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign Up';
        }
      }
    });
  }
});
