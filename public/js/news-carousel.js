/**
 * =====================================================
 * NeoTrace — News Carousel (Horizontal Scrolling)
 * =====================================================
 *
 * Manages horizontal news carousel layout with smooth scrolling,
 * auto-size cards, and keyboard/button navigation.
 */

// News carousel initialization and management
(function initNewsCarousel() {
  const newsGrid = document.getElementById("newsGrid");
  const carouselPrev = document.getElementById("newsCarouselPrev");
  const carouselNext = document.getElementById("newsCarouselNext");

  if (!newsGrid) return;

  // Convert grid to scrollable carousel layout
  newsGrid.classList.add("carousel-container");

  // Smooth scroll handler
  function scrollCarousel(direction) {
    const scrollAmount = 400; // pixels to scroll per click
    const currentScroll = newsGrid.scrollLeft;

    newsGrid.scrollTo({
      left: currentScroll + (direction === "next" ? scrollAmount : -scrollAmount),
      behavior: "smooth"
    });

    // Update button visibility after scroll
    setTimeout(updateCarouselButtons, 300);
  }

  // Update carousel buttons visibility based on scroll position
  function updateCarouselButtons() {
    if (!carouselPrev || !carouselNext) return;

    const atStart = newsGrid.scrollLeft <= 0;
    const atEnd = newsGrid.scrollLeft >= newsGrid.scrollWidth - newsGrid.clientWidth - 10;

    carouselPrev.style.opacity = atStart ? "0.3" : "1";
    carouselPrev.disabled = atStart;
    carouselNext.style.opacity = atEnd ? "0.3" : "1";
    carouselNext.disabled = atEnd;
  }

  // Event listeners
  if (carouselPrev) carouselPrev.addEventListener("click", () => scrollCarousel("prev"));
  if (carouselNext) carouselNext.addEventListener("click", () => scrollCarousel("next"));

  // Update buttons on scroll
  newsGrid.addEventListener("scroll", updateCarouselButtons);

  // Update on window resize
  window.addEventListener("resize", updateCarouselButtons);

  // Keyboard navigation
  newsGrid.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") scrollCarousel("prev");
    if (e.key === "ArrowRight") scrollCarousel("next");
  });

  // Initial button state
  updateCarouselButtons();
})();

/**
 * Override renderNews to apply horizontal carousel styling
 * Wraps the original renderNews and applies CSS classes for carousel layout
 */
(function configureCarouselLayout() {
  const observer = new MutationObserver(() => {
    const newsCards = document.querySelectorAll(".news-item");
    if (newsCards.length > 0) {
      // Add carousel styling to each news card
      newsCards.forEach((card) => {
        if (!card.classList.contains("carousel-item")) {
          card.classList.add("carousel-item");
          // Ensure min-width for horizontal layout
          card.style.minWidth = "380px";
          card.style.flexShrink = "0";
        }
      });
      observer.disconnect();
    }
  });

  const newsGrid = document.getElementById("newsGrid");
  if (newsGrid) {
    observer.observe(newsGrid, {
      childList: true,
      subtree: true
    });
  }
})();
