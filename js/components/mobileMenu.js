// ===============================
// 📱 MOBILE NAV SYSTEM
// ===============================

const navToggle = document.getElementById("navToggle");

const mobileMenu = document.getElementById("mobileMenu");

const mobileMenuClose = document.getElementById("mobileMenuClose");


// ===============================
// 🚀 OPEN MENU
// ===============================

function openMenu() {

  if (!mobileMenu) return;

  mobileMenu.classList.add("active");

  // freeze page scroll
  document.body.classList.add("no-scroll");

  // freeze navbar system
  document.body.classList.add("menu-open");
}


// ===============================
// ❌ CLOSE MENU
// ===============================

function closeMenu() {

  if (!mobileMenu) return;

  mobileMenu.classList.remove("active");

  // restore page scroll
  document.body.classList.remove("no-scroll");

  // restore navbar system
  document.body.classList.remove("menu-open");
}


// ===============================
// 🍔 TOGGLE BUTTON
// ===============================

navToggle?.addEventListener("click", () => {

  if (!mobileMenu) return;

  const isOpen = mobileMenu.classList.contains("active");

  isOpen
    ? closeMenu()
    : openMenu();
});


// ===============================
// ✖ CLOSE BUTTON
// ===============================

mobileMenuClose?.addEventListener("click", () => {

  closeMenu();
});


// ===============================
// 🖱 CLICK OUTSIDE PANEL
// ===============================

mobileMenu?.addEventListener("click", (e) => {

  if (e.target === mobileMenu) {

    closeMenu();
  }
});


// ===============================
// 🔗 CLOSE ON LINK CLICK
// ===============================

document
  .querySelectorAll(".mobile-menu a")
  .forEach((link) => {

    link.addEventListener("click", () => {

      closeMenu();
    });
  });


// ===============================
// ⌨ ESCAPE KEY
// ===============================

document.addEventListener("keydown", (e) => {

  if (e.key === "Escape") {

    closeMenu();
  }
});

// ===============================
// 🔍 MOBILE SEARCH
// ===============================

const mobileSearchIcon =
  document.getElementById("mobile-search-icon");

const mobileSearchInput =
  document.getElementById("mobile-search-input");

mobileSearchIcon?.addEventListener("click", () => {

  if (!mobileSearchInput) return;

  mobileSearchInput.classList.toggle("active");

  if (
    mobileSearchInput.classList.contains("active")
  ) {

    mobileSearchInput.focus();

  } else {

    mobileSearchInput.blur();
  }
});


// ===============================
// 🛒 MOBILE CART
// ===============================

const desktopCartIcon =
  document.getElementById("cart-icon");

const mobileCartIcon =
  document.getElementById("mobile-cart-icon");

mobileCartIcon?.addEventListener("click", () => {

  desktopCartIcon?.click();
});


// ===============================
// 🔢 SYNC MOBILE CART BADGE
// ===============================

const desktopCartBadge =
  document.getElementById("cart-badge");

const mobileCartBadge =
  document.getElementById("mobile-cart-badge");

function syncMobileCartBadge() {

  if (!desktopCartBadge || !mobileCartBadge) return;

  mobileCartBadge.textContent =
    desktopCartBadge.textContent;
}

// initial sync
syncMobileCartBadge();

// observe desktop badge updates
const badgeObserver = new MutationObserver(() => {

  syncMobileCartBadge();
});

if (desktopCartBadge) {

  badgeObserver.observe(desktopCartBadge, {
    childList: true,
    subtree: true
  });
}