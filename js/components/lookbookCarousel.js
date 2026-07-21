// ==========================
// LOOKBOOK CAROUSEL
// ==========================

const carouselCleanups = new WeakMap();

export function renderLookbookCarousel(root) {
  if (!root) return;

  const previousCleanup =
    carouselCleanups.get(root);

  if (previousCleanup) {
    previousCleanup();
  }

  const eventController =
    new AbortController();

  // ==========================
//  DATA
// ==========================
const slides = [

  [
    window.innerWidth <= 900
      ? "./assets/images/lookbook/lb1-mobile.webp"
      : "./assets/images/lookbook/lb1.webp"
  ],

  [
    "./assets/images/lookbook/lb1a.webp",
    "./assets/images/lookbook/lb1b.webp"
  ],

  [
    "./assets/images/lookbook/lb2a.webp",
    "./assets/images/lookbook/lb2b.webp"
  ],

  [
    "./assets/images/lookbook/lb3a.webp",
    "./assets/images/lookbook/lb3b.webp"
  ],

  [
    "./assets/images/lookbook/lb4a.webp",
    "./assets/images/lookbook/lb4b.webp"
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
  //  ELEMENTS
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
  //  STATE
  // ==========================
let currentIndex = -1;
let autoTimer = null;
let startTimer = null;
let unlockTimer = null;
let progressFrame = null;
let progressStartFrame = null;
let isAnimating = false;
let hasStarted = false;
let isCarouselVisible = false;

const AUTO_DELAY = 5000;

  // ==========================
  //  DOTS
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

  clearProgressFrames();

  progressBars.forEach((bar) => {

    bar.style.transition = "none";

    bar.style.transform =
      "scaleX(0)";

    //  force repaint
    bar.offsetHeight;

  });

}

function clearProgressFrames() {

  if (progressFrame !== null) {

    cancelAnimationFrame(progressFrame);
    progressFrame = null;

  }

  if (progressStartFrame !== null) {

    cancelAnimationFrame(progressStartFrame);
    progressStartFrame = null;

  }

}

function startProgressBar(index, onStart) {

  const bar =
    progressBars[index];

  if (!bar) return;

  clearProgressFrames();

  progressFrame = requestAnimationFrame(() => {

    progressFrame = null;

    bar.style.transition =
      `transform ${AUTO_DELAY}ms linear`;

    progressStartFrame = requestAnimationFrame(() => {

      progressStartFrame = null;

      bar.style.transform =
        "scaleX(1)";

      if (onStart) {
        onStart();
      }

    });

  });

}

function goToSlide(index) {

  //  validate before changing state
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= slidesEl.length ||
    isAnimating ||
    index === currentIndex
  ) {
    return false;
  }

  stopAuto(false);

  if (unlockTimer) {

    clearTimeout(unlockTimer);
    unlockTimer = null;

  }

  isAnimating = true;

  currentIndex = index;

  //  preload next slide images
const nextSlide =
  slidesEl[index + 1];

if (nextSlide) {

  const nextImages =
    nextSlide.querySelectorAll("img");

  // desktop-only aggressive decode
  if (window.innerWidth > 900) {

    nextImages.forEach((img) => {

      if (img.decode) {

        img.decode().catch(() => {});

      }

    });

  }

}

  //  move track
  track.style.transform =
    `translateX(-${index * 100}%)`;

  //  update dots
  dots.forEach((dot) => {

    dot.classList.remove("active");

  });

  dots[index].classList.add("active");

  //  unlock after transition
  unlockTimer = setTimeout(() => {

    isAnimating = false;
    unlockTimer = null;

  }, 700);

  return true;

}

  // ==========================
  //  AUTOPLAY
  // ==========================
  function startAuto() {

    stopAuto(true);

    if (
      currentIndex < 0 ||
      !isCarouselVisible ||
      document.hidden
    ) {
      return;
    }

    const cycleIndex = currentIndex;

    startProgressBar(
      cycleIndex,
      () => {

        if (
          currentIndex !== cycleIndex ||
          !isCarouselVisible ||
          document.hidden
        ) {
          return;
        }

        autoTimer = setTimeout(() => {

          autoTimer = null;

          const nextIndex =
            currentIndex >= slidesEl.length - 1
              ? 0
              : currentIndex + 1;

          if (
            goToSlide(nextIndex)
          ) {

            //  schedule next slide
            startAuto();

          }

        }, AUTO_DELAY);

      }
    );

  }

  function stopAuto(resetProgress = false) {

  if (autoTimer) {

    clearTimeout(autoTimer);

    autoTimer = null;

  }

  if (startTimer) {

    clearTimeout(startTimer);

    startTimer = null;

  }

  clearProgressFrames();

  //  only reset when needed
  if (resetProgress) {

    resetProgressBars();

  }

}

function resumeAuto() {

  startAuto();

}

  // ==========================
  //  DOT CLICK
  // ==========================
  dots.forEach((dot) => {

  dot.addEventListener("click", () => {

    if (goToSlide(
      Number(dot.dataset.index)
    )) {

      resumeAuto();

    }

  }, { signal: eventController.signal });

});

  // ==========================
  //  ARROWS
  // ==========================
  prevBtn.addEventListener("click", () => {

  if (goToSlide(
    Math.max(0, currentIndex - 1)
  )) {

    resumeAuto();

  }

}, { signal: eventController.signal });

  nextBtn.addEventListener("click", () => {

  if (goToSlide(
    Math.min(
      slidesEl.length - 1,
      currentIndex + 1
    )
  )) {

    resumeAuto();

  }

}, { signal: eventController.signal });

  // ==========================
  //  TOUCH SWIPE
  // ==========================
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouching = false;

  track.addEventListener(
  "touchstart",
  (e) => {

    touchStartX =
      e.touches[0].clientX;

    touchStartY =
      e.touches[0].clientY;

    isTouching = true;

  },
  {
    passive: true,
    signal: eventController.signal
  }
);

track.addEventListener(
  "touchend",
  (e) => {

    if (!isTouching) return;

    isTouching = false;

    const diffX =
      e.changedTouches[0].clientX -
      touchStartX;

    const diffY =
      e.changedTouches[0].clientY -
      touchStartY;

    const threshold = 70;
    let destination = null;

    // ==========================
    //  PREV
    // ==========================
    if (
      diffX > threshold &&
      Math.abs(diffX) > Math.abs(diffY)
    ) {

      destination =
        Math.max(0, currentIndex - 1);

    }

    // ==========================
    //  NEXT
    // ==========================
    else if (
      diffX < -threshold &&
      Math.abs(diffX) > Math.abs(diffY)
    ) {

      destination =
        Math.min(
          slidesEl.length - 1,
          currentIndex + 1
        );

    }

    if (
      destination !== null &&
      goToSlide(destination)
    ) {

      resumeAuto();

    }

  },
  {
    passive: true,
    signal: eventController.signal
  }
);

track.addEventListener(
  "touchcancel",
  () => {

    isTouching = false;

  },
  {
    passive: true,
    signal: eventController.signal
  }
);

  // ==========================
  //  INIT
  // ==========================
  goToSlide(0);

  // ==========================
//  START WHEN VISIBLE
// ==========================

const observer =
  new IntersectionObserver(

    (entries) => {

      entries.forEach((entry) => {

        // ==========================
        //  ENTER VIEW
        // ==========================
        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= 0.55
        ) {

          isCarouselVisible = true;

          //  only start once
          if (!hasStarted) {

            hasStarted = true;

            stopAuto(true);

            startTimer = setTimeout(() => {

              startTimer = null;

              if (
                isCarouselVisible &&
                !document.hidden
              ) {

                startAuto();

              }

            }, 1200);

          } else {

            resumeAuto();

          }

        }

        // ==========================
        //  PAUSE WHEN FAR AWAY
        // ==========================
        if (
          entry.intersectionRatio < 0.15
        ) {

          isCarouselVisible = false;
          stopAuto(true);

        }

      });

    },

    {
      threshold: [0.15, 0.55]
    }

  );

observer.observe(root);

document.addEventListener(
  "visibilitychange",
  () => {

    if (document.hidden) {

      stopAuto(true);
      return;

    }

    if (isCarouselVisible) {

      startAuto();

    }

  },
  { signal: eventController.signal }
);

const cleanupCarousel = () => {

  stopAuto(true);

  if (unlockTimer) {

    clearTimeout(unlockTimer);
    unlockTimer = null;

  }

  isAnimating = false;
  observer.disconnect();
  eventController.abort();

  if (
    carouselCleanups.get(root) ===
    cleanupCarousel
  ) {

    carouselCleanups.delete(root);

  }

};

carouselCleanups.set(
  root,
  cleanupCarousel
);

}