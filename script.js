// Mobile nav toggle, smooth scroll, reveal animations, and form validation + AJAX (Formspree)

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
          if (nav.classList.contains('show')) {
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

  // Form validation + AJAX submit (Formspree)
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
});
