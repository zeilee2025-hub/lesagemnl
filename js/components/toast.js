// ===============================
// TOAST COMPONENT
// ===============================

export function showToast(message) {
  const root = document.getElementById('toast-root');

  // safety check (important)
  if (!root) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  root.appendChild(toast);

  // trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // auto remove
  setTimeout(() => {
    toast.classList.remove('show');

    setTimeout(() => {
      toast.remove();
    }, 250);
  }, 2500);
}