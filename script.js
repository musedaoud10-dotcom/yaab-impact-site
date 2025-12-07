// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Close menu after clicking a link (mobile)
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A" && nav.classList.contains("open")) {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

// Smooth scroll for in-page links (optional enhancement)
document.addEventListener("click", (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const targetId = link.getAttribute("href").slice(1);
  const targetEl = document.getElementById(targetId);
  if (!targetEl) return;

  e.preventDefault();
  targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
});

// Dynamic year in footer
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}
