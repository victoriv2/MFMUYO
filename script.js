document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navDrawer = document.getElementById('navDrawer');
  const menuOverlay = document.getElementById('menuOverlay');
  const closeBtn = document.getElementById('closeBtn');

  function openMenu() {
    navDrawer.classList.add('open');
    menuOverlay.classList.add('open');
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    navDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navDrawer.classList.remove('open');
    menuOverlay.classList.remove('open');
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    navDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburgerBtn.addEventListener('click', () => {
    const isOpen = navDrawer.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
  }

  // Close when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navDrawer.classList.contains('open')) {
      closeMenu();
    }
  });

  // Bottom nav tab active state
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      navTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Carousel Slider & Indicator Sync
  const carouselTrack = document.getElementById('carouselTrack');
  const indicatorDots = document.querySelectorAll('.indicator-dot');

  if (carouselTrack && indicatorDots.length > 0) {
    const cards = carouselTrack.querySelectorAll('.carousel-card');

    function updateActiveIndicator(index) {
      indicatorDots.forEach((dot, i) => {
        if (i === index) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    // Click indicator to scroll to slide
    indicatorDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'), 10);
        if (cards[index]) {
          const cardLeft = cards[index].offsetLeft - carouselTrack.offsetLeft - 16;
          carouselTrack.scrollTo({
            left: cardLeft,
            behavior: 'smooth'
          });
          updateActiveIndicator(index);
        }
      });
    });

    // Sync indicators on horizontal scroll/swipe
    let scrollTimeout;
    carouselTrack.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const trackCenter = carouselTrack.scrollLeft + carouselTrack.clientWidth / 2;
        let closestIndex = 0;
        let minDiff = Infinity;

        cards.forEach((card, idx) => {
          const cardCenter = card.offsetLeft + card.clientWidth / 2;
          const diff = Math.abs(trackCenter - cardCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = idx;
          }
        });

        updateActiveIndicator(closestIndex);
      }, 50);
    });
  }

  // Floating Action Call Button & Modal
  const callFabBtn = document.getElementById('callFabBtn');
  const callModalOverlay = document.getElementById('callModalOverlay');
  const callModalClose = document.getElementById('callModalClose');

  function openCallModal() {
    if (callModalOverlay) {
      callModalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCallModal() {
    if (callModalOverlay) {
      callModalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (callFabBtn) {
    callFabBtn.addEventListener('click', openCallModal);
  }

  if (callModalClose) {
    callModalClose.addEventListener('click', closeCallModal);
  }

  if (callModalOverlay) {
    callModalOverlay.addEventListener('click', (e) => {
      if (e.target === callModalOverlay) {
        closeCallModal();
      }
    });
  }

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (callModalOverlay && callModalOverlay.classList.contains('open')) {
        closeCallModal();
      }
    }
  });
});

