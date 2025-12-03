/*
  Combined improved interactivity:
  - Mobile nav toggle
  - Smooth scrolling
  - Scroll-spy to highlight nav links
  - Reveal animations using IntersectionObserver
  - Client-side validation + AJAX submit to Formspree (uses form action)
*/

document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !expanded);
      nav.classList.toggle('show');
    });
  }

  // Smooth scroll for internal links (close mobile nav)
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
        if (nav.classList.contains('show')) {
          nav.classList.remove('show');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // Scroll-spy: highlight nav links for visible sections
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('#main-nav a');
  if (sections.length && navLinks.length) {
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.45 };
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector(`#main-nav a[href="#${id}"]`);
        if (link) {
          if (entry.isIntersecting) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        }
      });
    }, observerOptions);
    sections.forEach(s => sectionObserver.observe(s));
  }

  // Reveal animation for elements with .reveal
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(r => revealObserver.observe(r));
  }

  // Contact form: client validation + AJAX submission to Formspree
  const form = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (formMessage) { formMessage.textContent = ''; formMessage.style.color = ''; }

      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');
      let hasError = false;

      function setError(input, message) {
        const err = document.getElementById(`${input.id}-error`);
        if (err) err.textContent = message;
        hasError = true;
      }
      function clearError(input) {
        const err = document.getElementById(`${input.id}-error`);
        if (err) err.textContent = '';
      }

      // Validations
      if (!nameInput.value.trim()) setError(nameInput, 'Please enter your name.');
      else clearError(nameInput);

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim()) setError(emailInput, 'Please enter your email address.');
      else if (!emailPattern.test(emailInput.value.trim())) setError(emailInput, 'Please enter a valid email address.');
      else clearError(emailInput);

      if (!messageInput.value.trim()) setError(messageInput, 'Please enter a message.');
      else clearError(messageInput);

      if (hasError) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }

      try {
        const endpoint = form.action; // e.g. https://formspree.io/f/ABC123
        const data = new FormData(form);
        const res = await fetch(endpoint, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          form.reset();
          if (formMessage) {
            formMessage.style.color = 'green';
            formMessage.textContent = 'Thanks — your message was sent.';
          }
        } else {
          const body = await res.json().catch(() => ({}));
          if (formMessage) {
            formMessage.style.color = 'crimson';
            formMessage.textContent = body.error || 'Sorry — there was a problem sending your message.';
          }
        }
      } catch (err) {
        if (formMessage) {
          formMessage.style.color = 'crimson';
          formMessage.textContent = 'Network error — please try again later.';
        }
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send message'; }
      }
    });
  }
});
