// ==========================
// LOOKBOOK CAROUSEL
// ==========================

export function renderLookbookCarousel(root) {
  if (!root) return;

  // ==========================
//  DATA
// ==========================
const slides = [

  [
    window.innerWidth <= 900
      ? "/assets/images/lookbook/lb1-mobile.webp"
      : "/assets/images/lookbook/lb1.webp"
  ],

  [
    "/assets/images/lookbook/lb1a.webp",
    "/assets/images/lookbook/lb1b.webp"
  ],

  [
    "/assets/images/lookbook/lb2a.webp",
    "/assets/images/lookbook/lb2b.webp"
  ],

  [
    "/assets/images/lookbook/lb3a.webp",
    "/assets/images/lookbook/lb3b.webp"
  ],

  [
    "/assets/images/lookbook/lb4a.webp",
    "/assets/images/lookbook/lb4b.webp"
  ],

];

  // ==========================
  //  RENDER
  // ==========================
  root.innerHTML = `
    <div class="lookbook-carousel">

      <button class="lookbook-arrow left">‹</button>
      <button class="lookbook-arrow right">›</button>

      <div class="lookbook-track">

        ${slides.map((pair, i) => {

          // ==========================
          //  SOLO SLIDE
          // ==========================
          if (pair.length === 1) {

            return `
              <div class="lookbook-slide solo">

                <div class="lookbook-image">

                  <img
  src="${pair[0]}"
  alt="lookbook"
  loading="${i === 0 ? "eager" : "lazy"}"
  decoding="async"
/>

                </div>

              </div>
            `;

          }

          // ==========================
          //  DOUBLE SLIDE
          // ==========================
          return `
            <div class="lookbook-slide">

              <div class="lookbook-image">

                <img
  src="${pair[0]}"
  alt="lookbook"
  loading="${i === 0 ? "eager" : "lazy"}"
  decoding="async"
/>

              </div>

              <div class="lookbook-image">

                <img
  src="${pair[1]}"
  alt="lookbook"
  loading="${i === 0 ? "eager" : "lazy"}"
  decoding="async"
/>

              </div>

            </div>
          `;

        }).join("")}

      </div>

      <div class="lookbook-dots"></div>

    </div>
  `;

  // ==========================
  // ⚙️ ELEMENTS
  // ==========================
  const track =
    root.querySelector(".lookbook-track");

  const slidesEl =
    root.querySelectorAll(".lookbook-slide");

  const dotsContainer =
    root.querySelector(".lookbook-dots");

  const prevBtn =
    root.querySelector(".lookbook-arrow.left");

  const nextBtn =
    root.querySelector(".lookbook-arrow.right");

  // ==========================
  // ⚙️ STATE
  // ==========================
let currentIndex = 0;
let autoTimer = null;
let resumeTimer = null;
let isAnimating = false;
let hasStarted = false;

const AUTO_DELAY = 8000;

const RESUME_DELAY = 2500;

  // ==========================
  // 🔘 DOTS
  // ==========================
  dotsContainer.innerHTML = slides.map((_, i) => `
  <span
    class="dot ${i === 0 ? "active" : ""}"
    data-index="${i}"
  >

    <span class="dot-progress"></span>

  </span>
`).join("");

  const dots =
    dotsContainer.querySelectorAll(".dot");

    const progressBars =
  root.querySelectorAll(".dot-progress");

// ==========================
// 🎞 SLIDE CONTROL
// ==========================

function resetProgressBars() {

  progressBars.forEach((bar) => {

    bar.style.transition = "none";

    bar.style.transform =
      "scaleX(0)";

    // ✅ force repaint
    bar.offsetHeight;

  });

}

function startProgressBar(index) {

  const bar =
    progressBars[index];

  if (!bar) return;

  requestAnimationFrame(() => {

    requestAnimationFrame(() => {

      bar.style.transition =
        `transform ${AUTO_DELAY}ms linear`;

      bar.style.transform =
        "scaleX(1)";

    });

  });

}

function goToSlide(index) {

  // ✅ prevent overlap
  if (
    isAnimating &&
    index !== currentIndex
  ) {
    return;
  }

  isAnimating = true;

  currentIndex = index;

  // ✅ preload next slide images
const nextSlide =
  slidesEl[index + 1];

if (nextSlide) {

  const nextImages =
    nextSlide.querySelectorAll("img");

  // ✅ desktop-only aggressive decode
  if (window.innerWidth > 900) {

    nextImages.forEach((img) => {

      if (img.decode) {

        img.decode().catch(() => {});

      }

    });

  }

}

  // ✅ move track
  track.style.transform =
    `translateX(-${index * 100}%)`;

  // ✅ update dots
  dots.forEach((dot) => {

    dot.classList.remove("active");

  });

  dots[index].classList.add("active");

  // ✅ reset all progress bars
  resetProgressBars();

  // ✅ don't animate final slide
  if (index < slidesEl.length - 1) {

    startProgressBar(index);

  }

  // ✅ unlock after transition
  setTimeout(() => {

    isAnimating = false;

  }, 700);

}

  // ==========================
  // 🔁 AUTOPLAY
  // ==========================
  function startAuto() {

    stopAuto(true);

    autoTimer = setTimeout(() => {

      // ✅ stop forever at last slide
      if (
        currentIndex >= slidesEl.length - 1
      ) {

        stopAuto();
        return;

      }

      currentIndex++;

      goToSlide(currentIndex);

      // ✅ schedule next slide
      startAuto();

    }, AUTO_DELAY);

  }

  function stopAuto(resetProgress = false) {

  if (autoTimer) {

    clearTimeout(autoTimer);

    autoTimer = null;

  }

  if (resumeTimer) {

    clearTimeout(resumeTimer);

    resumeTimer = null;

  }

  // ✅ only reset when needed
  if (resetProgress) {

    resetProgressBars();

  }

}

function resumeAuto() {

  // ✅ clear old resume timer
  if (resumeTimer) {

    clearTimeout(resumeTimer);

  }

  // ✅ delay restart
  resumeTimer = setTimeout(() => {

    // ✅ don't restart at final slide
    if (
      currentIndex >= slidesEl.length - 1
    ) {
      return;
    }

    startAuto();

  }, RESUME_DELAY);

}

  // ==========================
  // 🔘 DOT CLICK
  // ==========================
  dots.forEach((dot) => {

  dot.addEventListener("click", () => {

    stopAuto();

    goToSlide(
      Number(dot.dataset.index)
    );

    resumeAuto();

  });

});

  // ==========================
  // ⬅️➡️ ARROWS
  // ==========================
  prevBtn.addEventListener("click", () => {

  stopAuto();

  currentIndex =
    Math.max(0, currentIndex - 1);

  goToSlide(currentIndex);

  resumeAuto();

});

  nextBtn.addEventListener("click", () => {

  stopAuto();

  currentIndex =
    Math.min(
      slidesEl.length - 1,
      currentIndex + 1
    );

  goToSlide(currentIndex);

  resumeAuto();

});

  // ==========================
  // 📱 TOUCH SWIPE
  // ==========================
  let touchStartX = 0;

  track.addEventListener(
  "touchstart",
  (e) => {

    touchStartX =
      e.touches[0].clientX;

    stopAuto();

  },
  { passive: true }
);

track.addEventListener(
  "touchend",
  (e) => {

    const diff =
      e.changedTouches[0].clientX -
      touchStartX;

    const threshold = 70;

    // ==========================
    // 👉 PREV
    // ==========================
    if (diff > threshold) {

      currentIndex =
        Math.max(0, currentIndex - 1);

    }

    // ==========================
    // 👉 NEXT
    // ==========================
    else if (diff < -threshold) {

      currentIndex =
        Math.min(
          slidesEl.length - 1,
          currentIndex + 1
        );

    }

    goToSlide(currentIndex);

    resumeAuto();

  },
  { passive: true }
);

  // ==========================
  // 🖱 HOVER PAUSE
  // ==========================
  root.addEventListener(
    "mouseenter",
    stopAuto
  );

  root.addEventListener(
  "mouseleave",
  () => {

    resumeAuto();

  }
);

  // ==========================
  // 🚀 INIT
  // ==========================
  goToSlide(0);

  // ==========================
// 👀 START WHEN VISIBLE
// ==========================

const observer =
  new IntersectionObserver(

    (entries) => {

      entries.forEach((entry) => {

        // ==========================
        // ✅ ENTER VIEW
        // ==========================
        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= 0.55
        ) {

          // ✅ only start once
          if (!hasStarted) {

            hasStarted = true;

            setTimeout(() => {

              if (
                currentIndex <
                slidesEl.length - 1
              ) {

                startAuto();

              }

            }, 1200);

          }

        }

        // ==========================
        // ✅ PAUSE WHEN FAR AWAY
        // ==========================
        if (
          entry.intersectionRatio < 0.15
        ) {

          stopAuto(false);

        }

      });

    },

    {
      threshold: [0.15, 0.55]
    }

  );

observer.observe(root);

}