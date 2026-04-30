// ==========================
// 🔥 LOOKBOOK CAROUSEL (FINAL FIXED)
// ==========================

export function renderLookbookCarousel(root) {
  if (!root) return;

  // ==========================
  // 📸 DATA
  // ==========================
  const slides = [
    ["/assets/images/lookbook/lb1.jpg"],

    ["/assets/images/lookbook/lb1a.jpg", "/assets/images/lookbook/lb1b.jpg"],
    ["/assets/images/lookbook/lb2a.jpg", "/assets/images/lookbook/lb2b.jpg"],
    ["/assets/images/lookbook/lb3a.jpg", "/assets/images/lookbook/lb3b.jpg"],
    ["/assets/images/lookbook/lb4a.jpg", "/assets/images/lookbook/lb4b.jpg"],
  ];

  // ==========================
  // 🧱 RENDER
  // ==========================
  root.innerHTML = `
    <div class="lookbook-carousel">

      <button class="lookbook-arrow left">‹</button>
      <button class="lookbook-arrow right">›</button>

      <div class="lookbook-track">
        ${slides.map((pair, i) => {

          // 🔥 SOLO
          if (pair.length === 1) {
            return `
              <div class="lookbook-slide solo">
                <div class="lookbook-image">
                  <img src="${pair[0]}" alt="lookbook" loading="${i === 0 ? "eager" : "lazy"}" />
                </div>
              </div>
            `;
          }

          // 🔥 DOUBLE
          return `
            <div class="lookbook-slide">
              <div class="lookbook-image">
                <img src="${pair[0]}" alt="lookbook" loading="${i === 0 ? "eager" : "lazy"}" />
              </div>
              <div class="lookbook-image">
                <img src="${pair[1]}" alt="lookbook" loading="${i === 0 ? "eager" : "lazy"}" />
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
  const prevBtn = root.querySelector(".lookbook-arrow.left");
  const nextBtn = root.querySelector(".lookbook-arrow.right");

  let currentIndex = 0;
  let autoTimer = null;
  let isDragging = false;
  let startX = 0;

  const AUTO_DELAY = 5000;

  // ==========================
  // 🔘 DOTS
  // ==========================
  dotsContainer.innerHTML = slides.map((_, i) => `
    <span class="dot ${i === 0 ? "active" : ""}" data-index="${i}"></span>
  `).join("");

  const dots = dotsContainer.querySelectorAll(".dot");

  // ==========================
  // 🎞 SLIDE CONTROL
  // ==========================
  function goToSlide(index) {
    currentIndex = index;
    track.style.transform = `translateX(-${index * 100}%)`;

    dots.forEach(dot => dot.classList.remove("active"));
    dots[index].classList.add("active");
  }

  // ==========================
  // 🔁 AUTO SLIDE
  // ==========================
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      currentIndex = (currentIndex + 1) % slidesEl.length;
      goToSlide(currentIndex);
    }, AUTO_DELAY);
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
  }

  // ==========================
  // 🔘 DOT CLICK
  // ==========================
  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      goToSlide(Number(dot.dataset.index));
      startAuto();
    });
  });

  // ==========================
  // ⬅️➡️ ARROWS
  // ==========================
  prevBtn.addEventListener("click", () => {
    currentIndex = Math.max(0, currentIndex - 1);
    goToSlide(currentIndex);
    startAuto();
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = Math.min(slidesEl.length - 1, currentIndex + 1);
    goToSlide(currentIndex);
    startAuto();
  });

  // ==========================
  // 🖱 DRAG (DESKTOP)
  // ==========================
  window.addEventListener("mouseup", (e) => {
    if (!isDragging) return;

    const diff = e.clientX - startX;
    const threshold = 30;

    if (diff > threshold) {
      currentIndex = Math.max(0, currentIndex - 1);
    } else if (diff < -threshold) {
      currentIndex = Math.min(slidesEl.length - 1, currentIndex + 1);
    }

    track.style.transition = "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)";

    goToSlide(currentIndex);
    startAuto();
    isDragging = false;
  });

  // ==========================
  // 📱 TOUCH (MOBILE)
  // ==========================
  let touchStartX = 0;

  track.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    track.style.transition = "none";
    stopAuto();
  });

  track.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    const threshold = 30;

    if (diff > threshold) {
      currentIndex = Math.max(0, currentIndex - 1);
    } else if (diff < -threshold) {
      currentIndex = Math.min(slidesEl.length - 1, currentIndex + 1);
    }

    track.style.transition = "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)";

    goToSlide(currentIndex);
    startAuto();
  });

  // ==========================
  // 🖱 HOVER PAUSE
  // ==========================
  root.addEventListener("mouseenter", stopAuto);
  root.addEventListener("mouseleave", startAuto);

  // ==========================
  // 🚀 INIT (FIXED)
  // ==========================
  goToSlide(0);

  // 🔥 WAIT FOR IMAGES BEFORE AUTOPLAY
  const images = root.querySelectorAll("img");

  let loaded = 0;

  images.forEach(img => {
    if (img.complete) {
      loaded++;
    } else {
      img.addEventListener("load", () => {
        loaded++;
        if (loaded === images.length) {
          startAuto();
        }
      });
    }
  });

  if (loaded === images.length) {
    startAuto();
  }
}