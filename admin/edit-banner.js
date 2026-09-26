// Edit Banner Page Logic
document.addEventListener('DOMContentLoaded', () => {
  let banners = getBanners();
  let pendingDeleteId = null;

  // DOM Elements
  const bannersListEl = document.getElementById('bannersList');
  const bannerListCountEl = document.getElementById('bannerListCount');
  const totalCountPill = document.getElementById('totalCountPill');
  const visibleCountPill = document.getElementById('visibleCountPill');
  const hiddenCountPill = document.getElementById('hiddenCountPill');

  const bannerForm = document.getElementById('bannerForm');
  const formHeading = document.getElementById('formHeading');
  const saveBtnText = document.getElementById('saveBtnText');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const resetFormBtn = document.getElementById('resetFormBtn');
  const editingBannerId = document.getElementById('editingBannerId');

  // Input Fields
  const inputBadge = document.getElementById('bannerBadge');
  const inputTitle = document.getElementById('bannerTitle');
  const inputDesc = document.getElementById('bannerDesc');
  const inputBtn1Text = document.getElementById('bannerBtn1Text');
  const inputBtn1Link = document.getElementById('bannerBtn1Link');
  const inputBtn2Text = document.getElementById('bannerBtn2Text');
  const inputBtn2Link = document.getElementById('bannerBtn2Link');
  const gradientRadios = document.querySelectorAll('input[name="bannerGradient"]');

  // Preview Elements
  const livePreviewCard = document.getElementById('livePreviewCard');
  const previewBadge = document.getElementById('previewBadge');
  const previewTitle = document.getElementById('previewTitle');
  const previewDesc = document.getElementById('previewDesc');
  const previewBtn1 = document.getElementById('previewBtn1');
  const previewBtn2 = document.getElementById('previewBtn2');

  // Search & Modals
  const bannerSearchInput = document.getElementById('bannerSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const openCreatorBtn = document.getElementById('openCreatorBtn');
  const deleteModalOverlay = document.getElementById('deleteModalOverlay');
  const deleteModalMsg = document.getElementById('deleteModalMsg');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  // 1. Update Live Preview
  function updateLivePreview() {
    const badge = inputBadge.value.trim() || 'ANNOUNCEMENT';
    const title = inputTitle.value.trim() || 'Your Banner Title Here';
    const desc = inputDesc.value.trim() || 'Description of this service, programme or announcement will appear here.';
    const btn1Text = inputBtn1Text.value.trim();
    const btn2Text = inputBtn2Text.value.trim();
    
    let selectedGradient = 'card-gradient-1';
    gradientRadios.forEach(r => {
      if (r.checked) selectedGradient = r.value;
    });

    previewBadge.textContent = badge;
    previewTitle.textContent = title;
    previewDesc.textContent = desc;

    if (btn1Text) {
      previewBtn1.textContent = btn1Text;
      previewBtn1.style.display = 'inline-block';
    } else {
      previewBtn1.style.display = 'none';
    }

    if (btn2Text) {
      previewBtn2.textContent = btn2Text;
      previewBtn2.style.display = 'inline-block';
    } else {
      previewBtn2.style.display = 'none';
    }

    livePreviewCard.className = `carousel-card ${selectedGradient} preview-card`;
  }

  // Attach input listeners for instant live preview
  [inputBadge, inputTitle, inputDesc, inputBtn1Text, inputBtn2Text].forEach(input => {
    input.addEventListener('input', updateLivePreview);
  });
  gradientRadios.forEach(radio => {
    radio.addEventListener('change', updateLivePreview);
  });

  // 2. Render Existing Banners List
  function renderBannersList(filterKeyword = '') {
    banners = getBanners();
    const query = filterKeyword.toLowerCase().trim();

    // Calculate stats
    const total = banners.length;
    const hiddenCount = banners.filter(b => b.hidden).length;
    const activeCount = total - hiddenCount;

    bannerListCountEl.textContent = total;
    totalCountPill.textContent = `Total: ${total}`;
    visibleCountPill.textContent = `Active: ${activeCount}`;
    hiddenCountPill.textContent = `Hidden: ${hiddenCount}`;

    // Filter banners for display
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
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-icon"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="reorder-icon">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
              <button class="reorder-btn" data-action="move-down" data-id="${banner.id}" ${isLast ? 'disabled' : ''} title="Move Down" aria-label="Move Down">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="reorder-icon">
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

          <!-- Actions: Edit, Hide, Remove -->
          <div class="banner-item-actions">
            <button class="action-btn ${hideBtnClass}" data-action="toggle-hide" data-id="${banner.id}">
              ${hideIcon}
              <span>${hideBtnText}</span>
            </button>
            <button class="action-btn btn-edit" data-action="edit" data-id="${banner.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-icon">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span>Edit</span>
            </button>
            <button class="action-btn btn-delete" data-action="delete" data-id="${banner.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-icon">
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

  // 3. Search handling
  bannerSearchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    clearSearchBtn.style.display = val ? 'block' : 'none';
    renderBannersList(val);
  });

  clearSearchBtn.addEventListener('click', () => {
    bannerSearchInput.value = '';
    clearSearchBtn.style.display = 'none';
    renderBannersList('');
  });

  // 4. Reposition, Hide, Edit & Delete Clicks
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
      renderBannersList(bannerSearchInput.value);
    }

    // Reposition: Move Down
    if (action === 'move-down' && index < banners.length - 1) {
      const temp = banners[index];
      banners[index] = banners[index + 1];
      banners[index + 1] = temp;
      saveBanners(banners);
      renderBannersList(bannerSearchInput.value);
    }

    // Hide / Show Toggle
    if (action === 'toggle-hide') {
      banners[index].hidden = !banners[index].hidden;
      saveBanners(banners);
      renderBannersList(bannerSearchInput.value);
    }

    // Edit Banner: Populate Form
    if (action === 'edit') {
      const b = banners[index];
      editingBannerId.value = b.id;
      inputBadge.value = b.badge || '';
      inputTitle.value = b.title || '';
      inputDesc.value = b.desc || '';
      inputBtn1Text.value = b.btn1Text || '';
      inputBtn1Link.value = b.btn1Link || '';
      inputBtn2Text.value = b.btn2Text || '';
      inputBtn2Link.value = b.btn2Link || '';

      gradientRadios.forEach(r => {
        r.checked = (r.value === (b.gradient || 'card-gradient-1'));
      });

      formHeading.textContent = `Edit Banner (#${index + 1})`;
      saveBtnText.textContent = 'Update & Save Changes';
      cancelEditBtn.style.display = 'inline-block';
      updateLivePreview();

      // Scroll smoothly to form
      document.getElementById('bannerFormSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Remove Banner: Open Confirmation Modal
    if (action === 'delete') {
      pendingDeleteId = id;
      const b = banners[index];
      deleteModalMsg.textContent = `Are you sure you want to remove "${b.title}"? This will immediately delete it from all carousels.`;
      deleteModalOverlay.classList.add('open');
    }
  });

  // 5. Delete Confirmation Modal Handlers
  cancelDeleteBtn.addEventListener('click', () => {
    deleteModalOverlay.classList.remove('open');
    pendingDeleteId = null;
  });

  confirmDeleteBtn.addEventListener('click', () => {
    if (!pendingDeleteId) return;
    banners = getBanners();
    banners = banners.filter(b => b.id !== pendingDeleteId);
    saveBanners(banners);
    deleteModalOverlay.classList.remove('open');
    pendingDeleteId = null;
    
    // If was editing deleted banner, reset form
    if (editingBannerId.value === pendingDeleteId) {
      resetForm();
    }
    renderBannersList(bannerSearchInput.value);
  });

  deleteModalOverlay.addEventListener('click', (e) => {
    if (e.target === deleteModalOverlay) {
      deleteModalOverlay.classList.remove('open');
      pendingDeleteId = null;
    }
  });

  // 6. Reset Form
  function resetForm() {
    editingBannerId.value = '';
    bannerForm.reset();
    formHeading.textContent = 'Create New Banner';
    saveBtnText.textContent = 'Save & Publish Banner';
    cancelEditBtn.style.display = 'none';
    gradientRadios[0].checked = true;
    updateLivePreview();
  }

  resetFormBtn.addEventListener('click', resetForm);
  cancelEditBtn.addEventListener('click', resetForm);

  if (openCreatorBtn) {
    openCreatorBtn.addEventListener('click', () => {
      resetForm();
      document.getElementById('bannerFormSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
      inputTitle.focus();
    });
  }

  // 7. Save / Create Banner Form Submit
  bannerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    banners = getBanners();

    const id = editingBannerId.value;
    const badge = inputBadge.value.trim();
    const title = inputTitle.value.trim();
    const desc = inputDesc.value.trim();
    const btn1Text = inputBtn1Text.value.trim();
    const btn1Link = inputBtn1Link.value.trim();
    const btn2Text = inputBtn2Text.value.trim();
    const btn2Link = inputBtn2Link.value.trim();

    let gradient = 'card-gradient-1';
    gradientRadios.forEach(r => {
      if (r.checked) gradient = r.value;
    });

    if (id) {
      // Editing existing banner
      const index = banners.findIndex(b => b.id === id);
      if (index !== -1) {
        banners[index] = {
          ...banners[index],
          badge,
          title,
          desc,
          btn1Text,
          btn1Link,
          btn2Text,
          btn2Link,
          gradient
        };
      }
    } else {
      // Creating new banner (place at top of carousel)
      const newBanner = {
        id: `banner-${Date.now()}`,
        badge: badge || 'ANNOUNCEMENT',
        title,
        desc,
        btn1Text,
        btn1Link,
        btn2Text,
        btn2Link,
        gradient,
        hidden: false
      };
      banners.unshift(newBanner);
    }

    saveBanners(banners);
    resetForm();
    renderBannersList(bannerSearchInput.value);

    // Scroll to list so user can see their updated/new banner
    document.querySelector('.banner-list-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Initial load & render
  updateLivePreview();
  renderBannersList();
});
