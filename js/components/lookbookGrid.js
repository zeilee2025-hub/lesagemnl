// ===============================
// LOOKBOOK CAROUSEL
// ===============================

import { createLookbookItem } from "./lookbookItem.js";

export function renderLookbookGrid(container, items) {
  if (!container || !items?.length) return;

  // 🔥 GROUP INTO PAIRS
  const slides = [];
  for (let i = 0; i < items.length; i += 2) {
    slides.push([items[i], items[i + 1]]);
  }

  // 🔥 BUILD HTML
  container.innerHTML = `
    <div class="lookbook-carousel">
      <div class="lookbook-track">
        ${slides.map(pair => createLookbookItem(pair)).join("")}
      </div>
    </div>
  `;

  const track = container.querySelector(".lookbook-track");

  let currentIndex = 0;
  const total = slides.length;

  function updateSlide() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  function startAutoSlide() {
    setInterval(() => {
      currentIndex = (currentIndex + 1) % total;
      updateSlide();
    }, 3000); // 🔥 slower (3s)
  }

  updateSlide();
  startAutoSlide();
}