/*
  YAAB Impact landing page interactivity

  This script adds interactive behaviour to the YAAB Impact website. It
  implements a responsive navigation toggle, smooth scrolling for internal
  links, and client‑side form validation with feedback messages.
*/

// Navigation toggle for mobile view
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

  // Smooth scrolling for internal links
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
        // Close navigation on mobile after clicking
        if (nav.classList.contains('show')) {
          nav.classList.remove('show');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // Contact form validation
  const form = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');
  if (form) {
    form.addEventListener('submit', (e) => {
      // Let Formspree handle the final submission; prevent only to validate first
      e.preventDefault();
      // Clear previous messages
      formMessage.textContent = '';
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email'); // id stays the same
      const messageInput = document.getElementById('message');
      let hasError = false;
      // Helper function to set error messages
      function setError(input, message) {
        const errorElement = document.getElementById(`${input.id}-error`);
        errorElement.textContent = message;
        hasError = true;
      }
      function clearError(input) {
        const errorElement = document.getElementById(`${input.id}-error`);
        errorElement.textContent = '';
      }
      // Validate name
      if (!nameInput.value.trim()) {
        setError(nameInput, 'Please enter your name.');
      } else {
        clearError(nameInput);
      }
      // Validate email using simple regex
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim()) {
        setError(emailInput, 'Please enter your email address.');
      } else if (!emailPattern.test(emailInput.value.trim())) {
        setError(emailInput, 'Please enter a valid email address.');
      } else {
        clearError(emailInput);
      }
      // Validate message
      if (!messageInput.value.trim()) {
        setError(messageInput, 'Please enter a message.');
      } else {
        clearError(messageInput);
      }
      // If no errors, submit the form to Formspree
      if (!hasError) {
        // Use the browser's native submission so Formspree receives it
        form.submit();
        formMessage.textContent = 'Sending message…';
      }
    });
  }
});
