// =========================
// HERO — AUTO FADE SYSTEM
// =========================

export function initHero() {
  const images = document.querySelectorAll('.hero__image');

  if (!images.length) return;

  let current = 0;

  setInterval(() => {
    // remove active from current
    images[current].classList.remove('hero__image--active');

    // move to next
    current = (current + 1) % images.length;

    // activate next
    images[current].classList.add('hero__image--active');
  }, 4500); // 4.5 seconds
}