export function initMarqueeDrag() {
  const marquee = document.querySelector(".marquee");
  if (!marquee) return;

  const track = marquee.querySelector(".marquee__track");
  if (!track) return;

  let isDown = false;
  let startX = 0;

  marquee.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX;

    track.style.animationPlayState = "paused";
  });

  marquee.addEventListener("mouseleave", () => {
    isDown = false;

    track.style.transform = "";
  });

  marquee.addEventListener("mouseup", () => {
    isDown = false;

    track.style.transform = "";

    if (!marquee.matches(":hover")) {
      track.style.animationPlayState = "running";
    }
  });

  marquee.addEventListener("mousemove", (e) => {
    if (!isDown) return;

    e.preventDefault();

    const walk = (e.pageX - startX) * 1.5;

    track.style.transform = `translateX(${walk}px)`;
  });

  marquee.addEventListener("mouseenter", () => {
    track.style.animationPlayState = "paused";
  });

  marquee.addEventListener("mouseleave", () => {
    if (!isDown) {
      track.style.animationPlayState = "running";
    }
  });
}