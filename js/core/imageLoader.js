// ===============================
// 🧠 IMAGE LOADER (QUEUE + PRIORITY)
// ===============================

const MAX_CONCURRENT = 4;

let active = 0;
const queue = [];
const cache = new Set();

function processQueue() {
  if (active >= MAX_CONCURRENT || queue.length === 0) return;

  const { src, resolve } = queue.shift();

  if (cache.has(src)) {
    resolve(src);
    processQueue();
    return;
  }

  active++;

  const img = new Image();
  img.src = src;

  img.onload = () => {
    cache.add(src);
    active--;
    resolve(src);
    processQueue();
  };

  img.onerror = () => {
    active--;
    resolve(null);
    processQueue();
  };
}


// ===============================
// 🚀 LOAD IMAGE (PUBLIC)
// ===============================
export function loadImage(src, priority = "normal") {
  return new Promise((resolve) => {
    if (!src) return resolve(null);

    const task = { src, resolve };

    if (priority === "high") {
      queue.unshift(task);
    } else {
      queue.push(task);
    }

    processQueue();
  });
}