// Edit Banner Page Logic: Search, Reposition, Hide/Show, and Remove
document.addEventListener('DOMContentLoaded', () => {
  let banners = getBanners();
  let pendingDeleteId = null;

  // DOM Elements
  const bannersListEl = document.getElementById('bannersList');
  const bannerListCountEl = document.getElementById('bannerListCount');
  const totalCountPill = document.getElementById('totalCountPill');
  const visibleCountPill = document.getElementById('visibleCountPill');
  const hiddenCountPill = document.getElementById('hiddenCountPill');

  // Search & Modals
  const bannerSearchInput = document.getElementById('bannerSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const deleteModalOverlay = document.getElementById('deleteModalOverlay');
  const deleteModalMsg = document.getElementById('deleteModalMsg');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  // Render Existing Banners List
  function renderBannersList(filterKeyword = '') {
    banners = getBanners();
    const query = filterKeyword.toLowerCase().trim();

    // Calculate statistics
    const total = banners.length;
    const hiddenCount = banners.filter(b => b.hidden).length;
    const activeCount = total - hiddenCount;

    if (bannerListCountEl) bannerListCountEl.textContent = total;
    if (totalCountPill) totalCountPill.textContent = `Total: ${total}`;
    if (visibleCountPill) visibleCountPill.textContent = `Active: ${activeCount}`;
    if (hiddenCountPill) hiddenCountPill.textContent = `Hidden: ${hiddenCount}`;

    // Filter banners for search
    const filtered = query ? banners.filter(b => 
      (b.title && b.title.toLowerCase().includes(query)) ||
      (b.badge && b.badge.toLowerCase().includes(query)) ||
      (b.desc && b.desc.toLowerCase().includes(query))
    ) : banners;

    if (filtered.length === 0) {
      bannersListEl.innerHTML = `
        <div class="no-results-box">
          <p>No banners found matching "<strong>${filterKeyword}</strong>".</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach((banner) => {
      // Find actual index in complete array for ordering
      const realIndex = banners.findIndex(b => b.id === banner.id);
      const isFirst = realIndex === 0;
      const isLast = realIndex === banners.length - 1;

      const statusBadge = banner.hidden
        ? `<span class="status-badge hidden">Hidden from visitors</span>`
        : `<span class="status-badge active">Active on site</span>`;

      const hideBtnText = banner.hidden ? 'Show' : 'Hide';
      const hideBtnClass = banner.hidden ? 'btn-show' : 'btn-hide';
      const hideIcon = banner.hidden 
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-icon" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-icon" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

      html += `
        <div class="banner-item-card ${banner.hidden ? 'is-hidden' : ''}" data-id="${banner.id}">
          <div class="banner-item-top">
            <div class="banner-order-tag">
              <span class="order-badge">#${realIndex + 1}</span>
              ${statusBadge}
            </div>

            <!-- Reposition Buttons (Move Up / Down) -->
            <div class="reorder-btns">
              <button class="reorder-btn" data-action="move-up" data-id="${banner.id}" ${isFirst ? 'disabled' : ''} title="Move Up" aria-label="Move Up">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="reorder-icon" aria-hidden="true">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
              <button class="reorder-btn" data-action="move-down" data-id="${banner.id}" ${isLast ? 'disabled' : ''} title="Move Down" aria-label="Move Down">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="reorder-icon" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <!-- Mini Preview -->
          <div class="banner-mini-preview ${banner.gradient || 'card-gradient-1'}">
            <span class="mini-badge">${banner.badge || 'ANNOUNCEMENT'}</span>
            <div class="mini-title">${banner.title}</div>
            <div class="mini-desc">${banner.desc}</div>
          </div>

          <!-- Actions: Hide & Remove -->
          <div class="banner-item-actions">
            <button class="action-btn ${hideBtnClass}" data-action="toggle-hide" data-id="${banner.id}">
              ${hideIcon}
              <span>${hideBtnText}</span>
            </button>
            <button class="action-btn btn-delete" data-action="delete" data-id="${banner.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-icon" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Remove</span>
            </button>
          </div>
        </div>
      `;
    });

    bannersListEl.innerHTML = html;
  }

  // Search handling
  if (bannerSearchInput) {
    bannerSearchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (clearSearchBtn) clearSearchBtn.style.display = val ? 'block' : 'none';
      renderBannersList(val);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      bannerSearchInput.value = '';
      clearSearchBtn.style.display = 'none';
      renderBannersList('');
    });
  }

  // Reposition, Hide & Remove Click Handlers
  bannersListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    banners = getBanners();
    const index = banners.findIndex(b => b.id === id);
    if (index === -1) return;

    // Reposition: Move Up
    if (action === 'move-up' && index > 0) {
      const temp = banners[index];
      banners[index] = banners[index - 1];
      banners[index - 1] = temp;
      saveBanners(banners);
      renderBannersList(bannerSearchInput ? bannerSearchInput.value : '');
    }

    // Reposition: Move Down
    if (action === 'move-down' && index < banners.length - 1) {
      const temp = banners[index];
      banners[index] = banners[index + 1];
      banners[index + 1] = temp;
      saveBanners(banners);
      renderBannersList(bannerSearchInput ? bannerSearchInput.value : '');
    }

    // Hide / Show Toggle
    if (action === 'toggle-hide') {
      banners[index].hidden = !banners[index].hidden;
      saveBanners(banners);
      renderBannersList(bannerSearchInput ? bannerSearchInput.value : '');
    }

    // Remove Banner: Open Confirmation Modal
    if (action === 'delete') {
      pendingDeleteId = id;
      const b = banners[index];
      if (deleteModalMsg) {
        deleteModalMsg.textContent = `Are you sure you want to remove "${b.title}"? This will immediately delete it from all carousels.`;
      }
      if (deleteModalOverlay) {
        deleteModalOverlay.classList.add('open');
      }
    }
  });

  // Delete Confirmation Modal Handlers
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      if (deleteModalOverlay) deleteModalOverlay.classList.remove('open');
      pendingDeleteId = null;
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      if (!pendingDeleteId) return;
      banners = getBanners();
      banners = banners.filter(b => b.id !== pendingDeleteId);
      saveBanners(banners);
      if (deleteModalOverlay) deleteModalOverlay.classList.remove('open');
      pendingDeleteId = null;
      renderBannersList(bannerSearchInput ? bannerSearchInput.value : '');
    });
  }

  if (deleteModalOverlay) {
    deleteModalOverlay.addEventListener('click', (e) => {
      if (e.target === deleteModalOverlay) {
        deleteModalOverlay.classList.remove('open');
        pendingDeleteId = null;
      }
    });
  }

  // Initial render
  renderBannersList();
});
