// ==========================
// 🔥 LOOKBOOK CAROUSEL (FINAL - NO DELAY SYSTEM)
// ==========================

export function renderLookbookCarousel(root) {

  const slides = [
    ["/assets/images/lookbook/lb1.jpg"],
    ["/assets/images/lookbook/lb1a.jpg", "/assets/images/lookbook/lb1b.jpg"],
    ["/assets/images/lookbook/lb2a.jpg", "/assets/images/lookbook/lb2b.jpg"],
    ["/assets/images/lookbook/lb3a.jpg", "/assets/images/lookbook/lb3b.jpg"],
    ["/assets/images/lookbook/lb4a.jpg", "/assets/images/lookbook/lb4b.jpg"]
  ];

  // ==========================
  // 🧱 RENDER
  // ==========================
  root.innerHTML = `
    <div class="lookbook-carousel">

      <!-- 🔘 ARROWS -->
      <button class="lookbook-arrow left">‹</button>
      <button class="lookbook-arrow right">›</button>

      <div class="lookbook-track">
        ${slides.map(pair => {

          if (pair.length === 1) {
            return `
              <div class="lookbook-slide solo">
                <div class="lookbook-image">
                  <img src="${pair[0]}" />
                </div>
              </div>
            `;
          }

          return `
            <div class="lookbook-slide">
              <div class="lookbook-image">
                <img src="${pair[0]}" />
              </div>
              <div class="lookbook-image">
                <img src="${pair[1]}" />
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <div class="lookbook-dots"></div>
    </div>
  `;

  // ==========================
  // ⚙️ STATE
  // ==========================
  const track = root.querySelector(".lookbook-track");
  const slidesEl = root.querySelectorAll(".lookbook-slide");
  const dotsContainer = root.querySelector(".lookbook-dots");
  const section = root.closest(".lookbook-carousel-section");

  const prevBtn = root.querySelector(".lookbook-arrow.left");
  const nextBtn = root.querySelector(".lookbook-arrow.right");

  let currentIndex = 0;
  let autoSlideTimeout = null;
  let hasStarted = false;

  const NORMAL_DURATION = 2800;
  const FIRST_DURATION = 1200;

  // ==========================
  // 🔘 DOTS
  // ==========================
  dotsContainer.innerHTML = slides.map((_, i) => `
    <span class="dot ${i === 0 ? "active" : ""}" data-index="${i}"></span>
  `).join("");

  const dots = dotsContainer.querySelectorAll(".dot");

// 🔥 FORCE FIRST SLIDE TO SHOW IMMEDIATELY
goToSlide(0);

  // ==========================
  // 🎞 GO TO SLIDE
  // ==========================
  function goToSlide(index) {
    track.style.transform = `translateX(-${index * 100}%)`;

    dots.forEach(dot => {
      dot.classList.remove("active");
      dot.style.animation = "none";
      dot.offsetHeight;
      dot.style.animation = null;
    });

    dots[index].classList.add("active");
  }

  // ==========================
  // 🔁 AUTO SLIDE (SMART TIMING)
  // ==========================
  function scheduleNextSlide(duration) {
    clearTimeout(autoSlideTimeout);

    autoSlideTimeout = setTimeout(() => {
      currentIndex = (currentIndex + 1) % slidesEl.length;
      goToSlide(currentIndex);

      // after first move → use normal speed
      scheduleNextSlide(NORMAL_DURATION);
    }, duration);
  }

  // ==========================
  // 👀 INTERSECTION
  // ==========================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasStarted) {
        hasStarted = true;

        goToSlide(0);

        // 🔥 START IMMEDIATELY (NO PAUSE)
        scheduleNextSlide(FIRST_DURATION);
      }
    });
  }, { threshold: 0.3 });

  if (section) observer.observe(section);

  // ==========================
  // 🔘 DOT CLICK
  // ==========================
  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      currentIndex = Number(dot.dataset.index);
      goToSlide(currentIndex);
      scheduleNextSlide(NORMAL_DURATION);
    });
  });

  // ==========================
  // ⬅️➡️ ARROWS
  // ==========================
  prevBtn.addEventListener("click", () => {
    currentIndex = Math.max(0, currentIndex - 1);
    goToSlide(currentIndex);
    scheduleNextSlide(NORMAL_DURATION);
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = Math.min(slidesEl.length - 1, currentIndex + 1);
    goToSlide(currentIndex);
    scheduleNextSlide(NORMAL_DURATION);
  });

  // ==========================
  // 🖱 DRAG
  // ==========================
  let startX = 0;
  let isDragging = false;

  track.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    clearTimeout(autoSlideTimeout);
  });

  window.addEventListener("mouseup", (e) => {
    if (!isDragging) return;

    const diff = e.clientX - startX;

    if (diff > 50) currentIndex = Math.max(0, currentIndex - 1);
    else if (diff < -50) currentIndex = Math.min(slidesEl.length - 1, currentIndex + 1);

    goToSlide(currentIndex);
    scheduleNextSlide(NORMAL_DURATION);
    isDragging = false;
  });

  // ==========================
  // 📱 TOUCH
  // ==========================
  let touchStartX = 0;

  track.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    clearTimeout(autoSlideTimeout);
  });

  track.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;

    if (diff > 50) currentIndex = Math.max(0, currentIndex - 1);
    else if (diff < -50) currentIndex = Math.min(slidesEl.length - 1, currentIndex + 1);

    goToSlide(currentIndex);
    scheduleNextSlide(NORMAL_DURATION);
  });

  // ==========================
  // 🖱 HOVER PAUSE
  // ==========================
  root.addEventListener("mouseenter", () => {
    clearTimeout(autoSlideTimeout);
  });

  root.addEventListener("mouseleave", () => {
    scheduleNextSlide(NORMAL_DURATION);
  });

}