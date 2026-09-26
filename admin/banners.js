// Shared Banners Data & Storage Manager for MFM Website
const BANNERS_STORAGE_KEY = 'mfm_banners';

const DEFAULT_BANNERS = [
  {
    id: 'banner-1',
    badge: 'WELCOME TO CHURCH',
    title: 'Mountain of Fire & Miracles Ministries',
    desc: 'South-South 3 Mega Region HQ, Uyo, Akwa Ibom State. A house of prayers, deliverance and divine transformations.',
    btn1Text: 'Join Live Service',
    btn1Link: '#services',
    btn2Text: 'Learn More',
    btn2Link: '#about',
    gradient: 'card-gradient-1',
    hidden: false
  },
  {
    id: 'banner-2',
    badge: 'FLAGSHIP PROGRAMME',
    title: 'Power Must Change Hands',
    desc: 'Monthly inter-denominational deliverance service holding every first Saturday of the month by 6:30 AM.',
    btn1Text: 'Programme Details',
    btn1Link: '#pmch',
    btn2Text: 'Prayer Points',
    btn2Link: '#prayer',
    gradient: 'card-gradient-2',
    hidden: false
  },
  {
    id: 'banner-3',
    badge: 'SUNDAY WORSHIP',
    title: 'Service of Signs & Wonders',
    desc: 'Experience supernatural breakthroughs and power-packed prophetic ministering every Lord\'s Day.',
    btn1Text: 'Service Schedule',
    btn1Link: '#schedule',
    btn2Text: '',
    btn2Link: '',
    gradient: 'card-gradient-3',
    hidden: false
  },
  {
    id: 'banner-4',
    badge: 'MIDWEEK REVIVAL',
    title: 'Manna Water Service',
    desc: 'Every Wednesday by 5:00 PM. Come with your water bottle for prophetic sanctification and healing.',
    btn1Text: 'Watch Replays',
    btn1Link: '#manna',
    btn2Text: '',
    btn2Link: '',
    gradient: 'card-gradient-4',
    hidden: false
  }
];

// Get all banners from localStorage or initialize with defaults
function getBanners() {
  try {
    const stored = localStorage.getItem(BANNERS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(DEFAULT_BANNERS));
      return DEFAULT_BANNERS;
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(DEFAULT_BANNERS));
      return DEFAULT_BANNERS;
    }
    return parsed;
  } catch (e) {
    console.error('Error loading banners from localStorage:', e);
    return DEFAULT_BANNERS;
  }
}

// Save banners array to localStorage
function saveBanners(banners) {
  try {
    localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(banners));
  } catch (e) {
    console.error('Error saving banners to localStorage:', e);
  }
}

// Render dynamic banners in the carousel track and update indicator dots
function renderCarousel(trackElement, indicatorsElement, options = { forAdmin: false }) {
  if (!trackElement || !indicatorsElement) return;

  const allBanners = getBanners();
  const displayBanners = options.forAdmin 
    ? allBanners 
    : allBanners.filter(b => !b.hidden);

  if (displayBanners.length === 0) {
    trackElement.innerHTML = `
      <article class="carousel-card card-gradient-1" style="justify-content:center; text-align:center;">
        <h2 class="card-heading">No Active Announcements</h2>
        <p class="card-desc">Check back soon for upcoming services and events.</p>
      </article>
    `;
    indicatorsElement.innerHTML = `<button class="indicator-dot active" data-index="0" aria-label="Slide 1"></button>`;
    return;
  }

  // Generate cards HTML
  let cardsHtml = '';
  displayBanners.forEach((banner, index) => {
    const hiddenBadge = (options.forAdmin && banner.hidden) 
      ? `<span style="background:rgba(255,165,0,0.85); color:#fff; font-size:0.6rem; padding:2px 8px; border-radius:10px; margin-left:8px; font-weight:700;">HIDDEN</span>` 
      : '';

    const btn1Html = banner.btn1Text ? `<a href="${banner.btn1Link || '#'}" class="card-btn btn-primary">${banner.btn1Text}</a>` : '';
    const btn2Html = banner.btn2Text ? `<a href="${banner.btn2Link || '#'}" class="card-btn btn-ghost">${banner.btn2Text}</a>` : '';

    cardsHtml += `
      <article class="carousel-card ${banner.gradient || 'card-gradient-1'}" data-banner-id="${banner.id}">
        <div>
          <div style="display:flex; align-items:center; flex-wrap:wrap; gap:4px; margin-bottom:0.4rem;">
            <span class="card-badge" style="margin-bottom:0;">${banner.badge || 'ANNOUNCEMENT'}</span>
            ${hiddenBadge}
          </div>
          <h2 class="card-heading">${banner.title}</h2>
          <p class="card-desc">${banner.desc}</p>
        </div>
        <div class="card-actions">
          ${btn1Html}
          ${btn2Html}
        </div>
      </article>
    `;
  });
  trackElement.innerHTML = cardsHtml;

  // Generate indicators HTML
  let indicatorsHtml = '';
  displayBanners.forEach((_, index) => {
    indicatorsHtml += `<button class="indicator-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Go to slide ${index + 1}"></button>`;
  });
  indicatorsElement.innerHTML = indicatorsHtml;
}
