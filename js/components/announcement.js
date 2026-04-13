export function initAnnouncement() {
  const items = document.querySelectorAll('.announcement-item');

  if (!items.length) return;

  let index = 0;

  function showSlide(i) {
    items.forEach(el => el.classList.remove('active'));
    items[i].classList.add('active');
  }

  function nextSlide() {
    index = (index + 1) % items.length;
    showSlide(index);
  }

  // ✅ ensure first is active (important safety)
  showSlide(index);

  // auto change every 4s
  setInterval(nextSlide, 4000);
}

// ✅🔥 AUTO INIT (THIS WAS MISSING)
document.addEventListener("DOMContentLoaded", () => {
  initAnnouncement();
});