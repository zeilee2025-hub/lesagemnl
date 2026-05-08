// ===============================
  // 📱 MOBILE NAV SYSTEM
  // ===============================

  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add("active");
    document.body.classList.add("no-scroll");
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }

  navToggle?.addEventListener("click", () => {
    if (!mobileMenu) return;

    const isOpen = mobileMenu.classList.contains("active");
    isOpen ? closeMenu() : openMenu();
  });

  mobileMenu?.addEventListener("click", (e) => {
    if (e.target === mobileMenu) {
      closeMenu();
    }
  });

  document.querySelectorAll(".mobile-menu a").forEach(link => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  });