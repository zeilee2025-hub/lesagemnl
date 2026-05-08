// ==========================
  // 🔍 SEARCH FUNCTIONALITY
  // ==========================

  const searchIcon = document.getElementById("search-icon");
  const searchInput = document.getElementById("search-input");

  searchIcon?.addEventListener("click", () => {
    searchInput.classList.toggle("active");
    searchInput.focus();
  });

  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (!query) return;

      window.location.href = `/shop.html?search=${encodeURIComponent(query)}`;
    }
  });