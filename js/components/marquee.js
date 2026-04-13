export function initMarqueeDrag() {
  const marquee = document.querySelector('.marquee');
  const track = document.querySelector('.marquee__track');

  if (!marquee || !track) return;

  let isDown = false;
  let startX;
  let scrollLeft = 0;

  marquee.addEventListener('mousedown', (e) => {
    isDown = true;
    marquee.classList.add('dragging');

    startX = e.pageX;
    scrollLeft = track.getBoundingClientRect().left;
  });

  marquee.addEventListener('mouseleave', () => {
    isDown = false;
    marquee.classList.remove('dragging');
  });

  marquee.addEventListener('mouseup', () => {
    isDown = false;
    marquee.classList.remove('dragging');
  });

  marquee.addEventListener('mousemove', (e) => {
    if (!isDown) return;

    e.preventDefault();

    const x = e.pageX;
    const walk = (x - startX) * 1.5;

    track.style.transform = `translateX(${walk}px)`;
  });
}