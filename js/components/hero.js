// =========================
// HERO — AUTO FADE SYSTEM
// =========================

export function initHero() {
  const images = document.querySelectorAll('.hero__image');

  // 🔒 CONFIG (you can toggle later)
  const ENABLE_HERO_SLIDE = false;

  // ❌ Do nothing if:
  // - slider disabled
  // - or only 1 image
  if (!ENABLE_HERO_SLIDE || images.length <= 1) return;

  let current = 0;

  setInterval(() => {
    images[current].classList.remove('hero__image--active');

    current = (current + 1) % images.length;

    images[current].classList.add('hero__image--active');
  }, 4500);
}