/* ==========================================================================
   GameVault — app.js
   Vanilla ES6+ JavaScript. No frameworks or libraries.
   Talks to the Spring Boot backend via the Fetch API.
   ========================================================================== */

'use strict';

/* ---------------------------------------------------------------------
   0. Configuration
   --------------------------------------------------------------------- */
const API_BASE_URL = 'http://13.212.48.196:8085/gamevault-backend/api';
const TAX_RATE = 0.08;          // 8% estimated tax
const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_FEE = 9.99;

// Cosmetic variant options offered in the UI. The backend model stores a
// single storage/color value per product; these lists let the shopper pick
// among plausible variants for that product's category without needing a
// real inventory-per-variant backend (out of scope for this demo).
const STORAGE_VARIANTS = ['512GB', '825GB', '1TB', '2TB'];
const COLOR_VARIANTS = ['Midnight Black', 'White', 'Carbon Black', 'Blue/Black'];

/* ---------------------------------------------------------------------
   1. Application State
   --------------------------------------------------------------------- */
const state = {
  allProducts: [],       // last fetched product list from the server (already filtered/sorted by API)
  filters: {
    category: '',
    brand: '',
    platform: '',
    search: '',
    sort: '',
    priceRange: '',      // "min-max" string, applied client-side
    minRating: ''         // applied client-side
  },
  cart: [],               // [{ lineId, productId, name, price, imageUrl, storage, color, quantity }]
  wishlist: new Set(),
  searchDebounceTimer: null
};

/* ---------------------------------------------------------------------
   2. DOM References
   --------------------------------------------------------------------- */
const dom = {
  navbar: document.getElementById('navbar'),
  hamburgerBtn: document.getElementById('hamburgerBtn'),
  navLinks: document.getElementById('navLinks'),
  searchInput: document.getElementById('searchInput'),

  productGrid: document.getElementById('productGrid'),
  resultsCount: document.getElementById('resultsCount'),
  emptyState: document.getElementById('emptyState'),
  emptyStateResetBtn: document.getElementById('emptyStateResetBtn'),
  sortSelect: document.getElementById('sortSelect'),

  sidebar: document.getElementById('sidebar'),
  filterToggleBtn: document.getElementById('filterToggleBtn'),
  clearFiltersBtn: document.getElementById('clearFiltersBtn'),

  cartToggleBtn: document.getElementById('cartToggleBtn'),
  cartBadge: document.getElementById('cartBadge'),
  cartDrawer: document.getElementById('cartDrawer'),
  cartCloseBtn: document.getElementById('cartCloseBtn'),
  drawerBackdrop: document.getElementById('drawerBackdrop'),
  cartItems: document.getElementById('cartItems'),
  cartSubtotal: document.getElementById('cartSubtotal'),
  cartTax: document.getElementById('cartTax'),
  cartShipping: document.getElementById('cartShipping'),
  cartTotal: document.getElementById('cartTotal'),
  checkoutBtn: document.getElementById('checkoutBtn'),

  modalBackdrop: document.getElementById('modalBackdrop'),
  productModal: document.getElementById('productModal'),
  modalCloseBtn: document.getElementById('modalCloseBtn'),
  modalContent: document.getElementById('modalContent'),

  loadingOverlay: document.getElementById('loadingOverlay'),
  toast: document.getElementById('toast')
};

/* ---------------------------------------------------------------------
   3. Init
   --------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', init);

function init() {
  attachGlobalListeners();
  fetchAndRenderProducts();
}

/* ---------------------------------------------------------------------
   4. Fetch & Render Products
   --------------------------------------------------------------------- */
async function fetchAndRenderProducts() {
  setLoading(true);

  try {
    const url = buildProductsUrl();
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const products = await response.json();
    state.allProducts = products;

    const visible = applyClientSideFilters(products);
    renderProducts(visible);
    updateResultsCount(visible.length, products.length);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    showToast('Could not load products. Please check API server at :8085', true);
    dom.productGrid.innerHTML = '';
    dom.emptyState.hidden = false;
  } finally {
    setLoading(false);
  }
}

/** Builds the /api/products URL with query params matching current filters. */
function buildProductsUrl() {
  const { category, brand, platform, search, sort } = state.filters;
  const params = new URLSearchParams();

  if (category) params.set('category', category);
  if (brand) params.set('brand', brand);
  if (platform) params.set('platform', platform);
  if (search) params.set('search', search);
  if (sort) params.set('sort', sort);

  const queryString = params.toString();
  return `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;
}

/**
 * Applies filters the backend doesn't natively support (price range,
 * minimum rating) to the already server-filtered product list.
 */
function applyClientSideFilters(products) {
  let result = products;

  if (state.filters.priceRange) {
    const [min, max] = state.filters.priceRange.split('-').map(Number);
    result = result.filter(p => p.price >= min && p.price <= max);
  }

  if (state.filters.minRating) {
    const minRating = Number(state.filters.minRating);
    result = result.filter(p => p.rating >= minRating);
  }

  return result;
}

function updateResultsCount(shown, totalFromServer) {
  dom.resultsCount.textContent = `${shown} product${shown === 1 ? '' : 's'} found`;
}

/* ---------------------------------------------------------------------
   5. Render Product Grid
   --------------------------------------------------------------------- */
function renderProducts(products) {
  dom.productGrid.innerHTML = '';

  if (!products || products.length === 0) {
    dom.emptyState.hidden = false;
    return;
  }

  dom.emptyState.hidden = true;

  const fragment = document.createDocumentFragment();
  products.forEach((product, index) => {
    fragment.appendChild(createProductCard(product, index));
  });
  dom.productGrid.appendChild(fragment);
}

function createProductCard(product, index) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.style.animationDelay = `${Math.min(index * 40, 400)}ms`;
  card.dataset.productId = product.id;

  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock === 0;
  const showStorageSelector = product.category === 'Consoles' || product.category === 'Handheld';
  const showColorSelector = product.category === 'Controllers';

  card.innerHTML = `
    <div class="product-card__media">
      <span class="stock-badge ${isLowStock ? 'low' : ''}">${isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${product.stock} left` : 'In Stock'}</span>
      <button class="wishlist-btn ${state.wishlist.has(product.id) ? 'active' : ''}" data-action="wishlist" aria-label="Toggle wishlist">
        ${state.wishlist.has(product.id) ? '♥' : '♡'}
      </button>
      <img src="${product.imageUrl}" alt="${escapeHtml(product.name)}" loading="lazy" />
      <button class="quick-view-btn" data-action="quick-view">Quick View</button>
    </div>

    <div class="product-card__brand">${escapeHtml(product.brand)}</div>
    <h3 class="product-card__name">${escapeHtml(product.name)}</h3>

    <div class="product-card__meta">
      <span class="meta-pill">${escapeHtml(product.platform)}</span>
      <span class="meta-pill">${escapeHtml(product.category)}</span>
    </div>

    <div class="product-card__rating">
      <span class="stars">${renderStars(product.rating)}</span>
      <span>${product.rating.toFixed(1)}</span>
    </div>

    <div class="product-card__options">
      ${showStorageSelector ? `
        <div class="option-row">
          <label for="storage-${product.id}">Storage</label>
          <select class="option-select" id="storage-${product.id}" data-role="storage">
            ${buildVariantOptions(STORAGE_VARIANTS, product.storage)}
          </select>
        </div>` : ''}
      ${showColorSelector ? `
        <div class="option-row">
          <label for="color-${product.id}">Color</label>
          <select class="option-select" id="color-${product.id}" data-role="color">
            ${buildVariantOptions(COLOR_VARIANTS, product.color)}
          </select>
        </div>` : ''}
      <div class="option-row">
        <label>Quantity</label>
        <div class="qty-control" data-role="qty-control">
          <button type="button" data-action="qty-decrease" aria-label="Decrease quantity">−</button>
          <span data-role="qty-value">1</span>
          <button type="button" data-action="qty-increase" aria-label="Increase quantity">+</button>
        </div>
      </div>
    </div>

    <div class="product-card__price-row">
      <span class="product-card__price">$${product.price.toFixed(2)}</span>
    </div>

    <div class="product-card__footer">
      <button class="add-to-cart-btn" data-action="add-to-cart" ${isOutOfStock ? 'disabled' : ''}>
        ${isOutOfStock ? 'Unavailable' : 'Add to Cart'}
      </button>
    </div>
  `;

  attachCardListeners(card, product);
  return card;
}

function buildVariantOptions(options, currentValue) {
  // Ensure the product's actual stored value is included and selected by default.
  const list = options.includes(currentValue) ? options : [currentValue, ...options];
  return list.map(opt => `<option value="${escapeHtml(opt)}" ${opt === currentValue ? 'selected' : ''}>${escapeHtml(opt)}</option>`).join('');
}

function renderStars(rating) {
  const fullStars = Math.round(rating);
  return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
}

/* ---------------------------------------------------------------------
   6. Product Card Interactions
   --------------------------------------------------------------------- */
function attachCardListeners(card, product) {
  const qtyValueEl = card.querySelector('[data-role="qty-value"]');

  card.querySelector('[data-action="qty-increase"]').addEventListener('click', () => {
    qtyValueEl.textContent = String(Number(qtyValueEl.textContent) + 1);
  });

  card.querySelector('[data-action="qty-decrease"]').addEventListener('click', () => {
    const current = Number(qtyValueEl.textContent);
    if (current > 1) qtyValueEl.textContent = String(current - 1);
  });

  card.querySelector('[data-action="wishlist"]').addEventListener('click', (e) => {
    toggleWishlist(product.id, e.currentTarget);
  });

  card.querySelector('[data-action="quick-view"]').addEventListener('click', () => {
    openProductModal(product.id);
  });

  card.querySelector('[data-action="add-to-cart"]').addEventListener('click', () => {
    const storageSelect = card.querySelector('[data-role="storage"]');
    const colorSelect = card.querySelector('[data-role="color"]');
    const quantity = Number(qtyValueEl.textContent);

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      storage: storageSelect ? storageSelect.value : null,
      color: colorSelect ? colorSelect.value : null,
      quantity
    });
  });
}

function toggleWishlist(productId, btnEl) {
  if (state.wishlist.has(productId)) {
    state.wishlist.delete(productId);
    btnEl.classList.remove('active');
    btnEl.textContent = '♡';
  } else {
    state.wishlist.add(productId);
    btnEl.classList.add('active');
    btnEl.textContent = '♥';
  }
}

/* ---------------------------------------------------------------------
   7. Product Quick View Modal
   --------------------------------------------------------------------- */
async function openProductModal(productId) {
  setLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productId)}`);
    if (!response.ok) throw new Error('Product not found');
    const product = await response.json();
    renderProductModal(product);
    dom.productModal.classList.add('open');
    dom.productModal.setAttribute('aria-hidden', 'false');
    dom.modalBackdrop.classList.add('show');
  } catch (error) {
    console.error('Failed to load product details:', error);
    showToast('Could not load product details.', true);
  } finally {
    setLoading(false);
  }
}

function renderProductModal(product) {
  const isOutOfStock = product.stock === 0;

  dom.modalContent.innerHTML = `
    <div class="modal-media">
      <img src="${product.imageUrl}" alt="${escapeHtml(product.name)}" width="360" />
    </div>
    <div class="modal-info">
      <span class="modal-info__brand">${escapeHtml(product.brand)}</span>
      <h2 class="modal-info__name">${escapeHtml(product.name)}</h2>

      <div class="modal-info__rating">
        <span class="stars">${renderStars(product.rating)}</span>
        <span>${product.rating.toFixed(1)} out of 5</span>
      </div>

      <div class="modal-info__price">$${product.price.toFixed(2)}</div>

      <p class="modal-info__desc">${escapeHtml(product.description)}</p>

      <div class="spec-list">
        <div class="spec-row"><span>Platform</span><span>${escapeHtml(product.platform)}</span></div>
        <div class="spec-row"><span>Category</span><span>${escapeHtml(product.category)}</span></div>
        ${product.storage && product.storage !== 'N/A' ? `<div class="spec-row"><span>Storage</span><span>${escapeHtml(product.storage)}</span></div>` : ''}
        ${product.color && product.color !== 'N/A' ? `<div class="spec-row"><span>Color</span><span>${escapeHtml(product.color)}</span></div>` : ''}
      </div>

      <div class="modal-availability">
        <span class="availability-dot ${isOutOfStock ? 'low' : ''}"></span>
        <span>${isOutOfStock ? 'Out of stock' : `${product.stock} units available`}</span>
      </div>

      <button class="btn btn--primary btn--full" data-action="modal-add-to-cart" ${isOutOfStock ? 'disabled' : ''}>
        ${isOutOfStock ? 'Unavailable' : 'Add to Cart'}
      </button>
    </div>
  `;

  dom.modalContent.querySelector('[data-action="modal-add-to-cart"]')?.addEventListener('click', () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      storage: product.storage !== 'N/A' ? product.storage : null,
      color: product.color !== 'N/A' ? product.color : null,
      quantity: 1
    });
    closeProductModal();
  });
}

function closeProductModal() {
  dom.productModal.classList.remove('open');
  dom.productModal.setAttribute('aria-hidden', 'true');
  dom.modalBackdrop.classList.remove('show');
}

/* ---------------------------------------------------------------------
   8. Shopping Cart
   --------------------------------------------------------------------- */
function addToCart({ productId, name, price, imageUrl, storage, color, quantity }) {
  // Merge with an existing line item if the same product + options combo exists.
  const existing = state.cart.find(
    item => item.productId === productId && item.storage === storage && item.color === color
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({
      lineId: `${productId}-${storage || 'na'}-${color || 'na'}-${Date.now()}`,
      productId,
      name,
      price,
      imageUrl,
      storage,
      color,
      quantity
    });
  }

  renderCart();
  updateCartBadge();
  bumpCartBadge();
  showToast(`${name} added to cart`);
}

function removeFromCart(lineId) {
  state.cart = state.cart.filter(item => item.lineId !== lineId);
  renderCart();
  updateCartBadge();
}

function changeCartQuantity(lineId, delta) {
  const item = state.cart.find(i => i.lineId === lineId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(lineId);
    return;
  }

  renderCart();
  updateCartBadge();
}

function renderCart() {
  if (state.cart.length === 0) {
    dom.cartItems.innerHTML = `<div class="cart-empty">Your cart is empty. Time to gear up!</div>`;
    updateCartTotals();
    return;
  }

  dom.cartItems.innerHTML = state.cart.map(item => `
    <div class="cart-item" data-line-id="${item.lineId}">
      <div class="cart-item__img"><img src="${item.imageUrl}" alt="${escapeHtml(item.name)}" /></div>
      <div class="cart-item__body">
        <div class="cart-item__name">${escapeHtml(item.name)}</div>
        ${item.storage || item.color ? `<div class="cart-item__options">${[item.storage, item.color].filter(Boolean).map(escapeHtml).join(' · ')}</div>` : ''}
        <div class="cart-item__row">
          <div class="qty-control" data-role="cart-qty-control">
            <button type="button" data-action="cart-qty-decrease" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-action="cart-qty-increase" aria-label="Increase quantity">+</button>
          </div>
          <span class="cart-item__price">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
        <button class="cart-item__remove" data-action="cart-remove">Remove</button>
      </div>
    </div>
  `).join('');

  // Attach per-item listeners
  dom.cartItems.querySelectorAll('.cart-item').forEach(itemEl => {
    const lineId = itemEl.dataset.lineId;
    itemEl.querySelector('[data-action="cart-qty-increase"]').addEventListener('click', () => changeCartQuantity(lineId, 1));
    itemEl.querySelector('[data-action="cart-qty-decrease"]').addEventListener('click', () => changeCartQuantity(lineId, -1));
    itemEl.querySelector('[data-action="cart-remove"]').addEventListener('click', () => removeFromCart(lineId));
  });

  updateCartTotals();
}

function updateCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const total = subtotal + tax + shipping;

  dom.cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  dom.cartTax.textContent = `$${tax.toFixed(2)}`;
  dom.cartShipping.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
  dom.cartTotal.textContent = `$${total.toFixed(2)}`;

  dom.checkoutBtn.disabled = state.cart.length === 0;
}

function updateCartBadge() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  dom.cartBadge.textContent = String(totalItems);
}

function bumpCartBadge() {
  dom.cartBadge.classList.remove('bump');
  // Force reflow so the animation can retrigger on consecutive adds
  void dom.cartBadge.offsetWidth;
  dom.cartBadge.classList.add('bump');
}

function openCartDrawer() {
  dom.cartDrawer.classList.add('open');
  dom.cartDrawer.setAttribute('aria-hidden', 'false');
  dom.drawerBackdrop.classList.add('show');
}

function closeCartDrawer() {
  dom.cartDrawer.classList.remove('open');
  dom.cartDrawer.setAttribute('aria-hidden', 'true');
  dom.drawerBackdrop.classList.remove('show');
}

async function checkout() {
  if (state.cart.length === 0) return;

  setLoading(true);
  try {
    const payload = {
      items: state.cart.map(item => ({ productId: item.productId, quantity: item.quantity }))
    };

    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Checkout failed with status ${response.status}`);

    const result = await response.json();

    if (result.status === 'success') {
      showToast(result.message || 'Order placed successfully!');
      state.cart = [];
      renderCart();
      updateCartBadge();
      closeCartDrawer();
    } else {
      showToast(result.message || 'Something went wrong with checkout.', true);
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showToast('Checkout failed. Please try again.', true);
  } finally {
    setLoading(false);
  }
}

/* ---------------------------------------------------------------------
   9. Filters, Search, Sort
   --------------------------------------------------------------------- */
function attachGlobalListeners() {
  // Hamburger / mobile nav
  dom.hamburgerBtn.addEventListener('click', () => {
    const isOpen = dom.navLinks.classList.toggle('open');
    dom.hamburgerBtn.classList.toggle('open', isOpen);
    dom.hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const navTarget = link.dataset.nav;
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      dom.navLinks.classList.remove('open');
      dom.hamburgerBtn.classList.remove('open');

      if (navTarget && navTarget !== 'home' && navTarget !== 'deals') {
        setFilter('category', navTarget);
      } else if (navTarget === 'home') {
        clearAllFilters(false);
      } else if (navTarget === 'deals') {
        setFilter('sort', 'priceAsc');
      }
    });
  });

  // Search (debounced live search)
  dom.searchInput.addEventListener('input', (e) => {
    clearTimeout(state.searchDebounceTimer);
    const value = e.target.value;
    state.searchDebounceTimer = setTimeout(() => {
      state.filters.search = value.trim();
      fetchAndRenderProducts();
    }, 280);
  });

  // Sort
  dom.sortSelect.addEventListener('change', (e) => {
    state.filters.sort = e.target.value;
    fetchAndRenderProducts();
  });

  // Sidebar radio filters (category, brand, platform, price, rating)
  ['filterCategory', 'filterBrand', 'filterPlatform', 'filterPrice', 'filterRating'].forEach(groupId => {
    const group = document.getElementById(groupId);
    const filterType = group.dataset.filterType;
    group.addEventListener('change', (e) => {
      const value = e.target.value;
      applyFilterFromGroup(filterType, value);
    });
  });

  dom.clearFiltersBtn.addEventListener('click', () => clearAllFilters(true));
  dom.emptyStateResetBtn.addEventListener('click', () => clearAllFilters(true));

  // Featured category cards
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      if (card.dataset.platform) setFilter('platform', card.dataset.platform);
      if (card.dataset.category) setFilter('category', card.dataset.category);
      document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Mobile filter sidebar toggle
  dom.filterToggleBtn.addEventListener('click', () => dom.sidebar.classList.add('open'));

  // Cart drawer
  dom.cartToggleBtn.addEventListener('click', openCartDrawer);
  dom.cartCloseBtn.addEventListener('click', closeCartDrawer);
  dom.drawerBackdrop.addEventListener('click', () => {
    closeCartDrawer();
    dom.sidebar.classList.remove('open');
  });
  dom.checkoutBtn.addEventListener('click', checkout);

  // Modal
  dom.modalCloseBtn.addEventListener('click', closeProductModal);
  dom.modalBackdrop.addEventListener('click', closeProductModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeCartDrawer();
      dom.sidebar.classList.remove('open');
    }
  });
}

function applyFilterFromGroup(filterType, value) {
  if (filterType === 'price') {
    state.filters.priceRange = value;
    renderFilteredFromCache();
  } else if (filterType === 'rating') {
    state.filters.minRating = value;
    renderFilteredFromCache();
  } else {
    state.filters[filterType] = value;
    fetchAndRenderProducts();
  }
}

/** Re-applies client-side-only filters (price/rating) without re-fetching from the server. */
function renderFilteredFromCache() {
  const visible = applyClientSideFilters(state.allProducts);
  renderProducts(visible);
  updateResultsCount(visible.length, state.allProducts.length);
}

function setFilter(filterType, value) {
  state.filters[filterType] = value;
  syncSidebarInputs();
  fetchAndRenderProducts();
}

/** Keeps the sidebar radio buttons visually in sync with state.filters. */
function syncSidebarInputs() {
  const map = {
    category: 'category',
    brand: 'brand',
    platform: 'platform',
    priceRange: 'price',
    minRating: 'rating'
  };

  Object.entries(map).forEach(([stateKey, inputName]) => {
    const value = state.filters[stateKey] ?? '';
    const radios = document.querySelectorAll(`input[name="${inputName}"]`);
    radios.forEach(radio => {
      radio.checked = radio.value === value;
    });
  });
}

function clearAllFilters(shouldRefetch) {
  state.filters = { category: '', brand: '', platform: '', search: state.filters.search, sort: '', priceRange: '', minRating: '' };
  dom.sortSelect.value = '';
  syncSidebarInputs();
  if (shouldRefetch) {
    state.filters.search = '';
    dom.searchInput.value = '';
    fetchAndRenderProducts();
  }
}

/* ---------------------------------------------------------------------
   10. UI Helpers
   --------------------------------------------------------------------- */
function setLoading(isLoading) {
  dom.loadingOverlay.classList.toggle('hidden', !isLoading);
}

let toastTimer = null;
function showToast(message, isError = false) {
  dom.toast.textContent = message;
  dom.toast.classList.toggle('error', isError);
  dom.toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => dom.toast.classList.remove('show'), 2600);
}

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(value);
  return div.innerHTML;
}