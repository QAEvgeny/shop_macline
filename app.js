const products = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    category: "iPhone",
    line: "Apple A17 Pro, 256 ГБ",
    price: 129990,
    oldPrice: 139990,
    rating: 4.9,
    popular: 98,
    isNew: true,
    inStock: true,
    sale: true,
    art: "phone",
    specs: ["титановый корпус и USB-C", "камера 48 Мп, запись ProRes"],
    tags: ["Новинка", "В наличии"]
  },
  {
    id: 2,
    name: "MacBook Air 13 M3",
    category: "Mac",
    line: "8-ядерный CPU, 16 ГБ, 512 ГБ",
    price: 154990,
    oldPrice: null,
    rating: 4.8,
    popular: 92,
    isNew: true,
    inStock: true,
    sale: false,
    art: "laptop",
    specs: ["до 18 часов работы", "тонкий корпус 1,24 кг"],
    tags: ["M3", "Хит"]
  },
  {
    id: 3,
    name: "iPad Pro 11 M4",
    category: "iPad",
    line: "Ultra Retina XDR, 256 ГБ",
    price: 119990,
    oldPrice: null,
    rating: 4.7,
    popular: 86,
    isNew: true,
    inStock: true,
    sale: false,
    art: "tablet",
    specs: ["чип M4 для графики и монтажа", "поддержка Apple Pencil Pro"],
    tags: ["M4", "Pro"]
  },
  {
    id: 4,
    name: "Apple Watch Series 9",
    category: "Watch",
    line: "45 мм, GPS, Midnight",
    price: 41990,
    oldPrice: 48990,
    rating: 4.6,
    popular: 81,
    isNew: false,
    inStock: true,
    sale: true,
    art: "watch",
    specs: ["яркий Always-On дисплей", "датчики здоровья и тренировок"],
    tags: ["Скидка", "GPS"]
  },
  {
    id: 5,
    name: "AirPods Pro 2",
    category: "Audio",
    line: "USB-C, MagSafe Case",
    price: 27990,
    oldPrice: 32990,
    rating: 4.8,
    popular: 88,
    isNew: false,
    inStock: true,
    sale: true,
    art: "audio",
    specs: ["активное шумоподавление", "адаптивный режим прозрачности"],
    tags: ["Скидка", "ANC"]
  },
  {
    id: 6,
    name: "Mac Studio M2 Max",
    category: "Mac",
    line: "32 ГБ, 1 ТБ SSD",
    price: 249990,
    oldPrice: null,
    rating: 4.9,
    popular: 75,
    isNew: false,
    inStock: false,
    sale: false,
    art: "desktop",
    specs: ["производительность для 3D и видео", "компактный алюминиевый корпус"],
    tags: ["Под заказ", "Pro"]
  }
];

const selectors = {
  grid: "#productGrid",
  resultCount: "#resultCount",
  favoriteCount: "#favoriteCount",
  cartCount: "#cartCount",
  cartTotal: "#cartTotal",
  cartItems: "#cartItems",
  toast: "#toast",
  searchForm: "#searchForm",
  searchInput: "#searchInput",
  categoryQuick: "#categoryQuick",
  sortSelect: "#sortSelect",
  filters: ".filters",
  resetFilters: "#resetFilters",
  cartButton: "#cartButton",
  favoritesButton: "#favoritesButton",
  loginButton: "#loginButton",
  checkoutButton: "#checkoutButton",
  checkoutForm: "#checkoutForm",
  checkoutSummary: "#checkoutSummary",
  authForm: "#authForm",
  nameInput: "#nameInput",
  emailInput: "#emailInput",
  phoneInput: "#phoneInput",
  addressInput: "#addressInput",
  profileText: "#profileText",
  profileInitial: "#profileInitial"
};

const elements = Object.fromEntries(
  Object.entries(selectors).map(([key, selector]) => [key, document.querySelector(selector)])
);

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");

const allowedArtClasses = new Set(["phone", "laptop", "tablet", "watch", "audio", "desktop"]);

const state = {
  query: "",
  quickCategory: "all",
  sort: "popular",
  view: "catalog",
  favorites: new Set(loadStorage("maclineFavorites", [])),
  cart: {},
  user: loadStorage("maclineUser", null),
  activeLayer: null,
  lastFocused: null,
  pendingCheckout: false
};

state.cart = normalizeCart(loadStorage("maclineCart", {}));

function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    showToast("Не удалось сохранить данные в браузере");
  }
}

function normalizeCart(cart) {
  return Object.entries(cart || {}).reduce((result, [id, quantity]) => {
    const productId = Number(id);
    const product = products.find((item) => item.id === productId);
    const safeQuantity = Math.max(0, Math.floor(Number(quantity)));

    if (product && safeQuantity > 0) {
      result[productId] = safeQuantity;
    }

    return result;
  }, {});
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0
  }).format(value);
}

function getCheckedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function getCartEntries() {
  return Object.entries(state.cart)
    .map(([id, quantity]) => {
      const product = products.find((item) => item.id === Number(id));
      return product ? { product, quantity } : null;
    })
    .filter(Boolean);
}

function getFilteredProducts() {
  const categories = getCheckedValues("category");
  const price = document.querySelector('input[name="price"]:checked').value;
  const stockOnly = document.querySelector("#stockOnly").checked;
  const saleOnly = document.querySelector("#saleOnly").checked;
  const query = state.query.trim().toLowerCase();

  return products
    .filter((product) => {
      const searchable = `${product.name} ${product.category} ${product.line} ${product.specs.join(" ")}`.toLowerCase();
      const matchesView = state.view !== "favorites" || state.favorites.has(product.id);
      const matchesQuery = !query || searchable.includes(query);
      const matchesQuick = state.quickCategory === "all" || product.category === state.quickCategory;
      const matchesCategory = categories.length === 0 || categories.includes(product.category);
      const matchesStock = !stockOnly || product.inStock;
      const matchesSale = !saleOnly || product.sale;
      const matchesPrice =
        price === "all" ||
        (price === "under100" && product.price < 100000) ||
        (price === "100to200" && product.price >= 100000 && product.price <= 200000) ||
        (price === "over200" && product.price > 200000);

      return matchesView && matchesQuery && matchesQuick && matchesCategory && matchesStock && matchesSale && matchesPrice;
    })
    .sort((a, b) => {
      if (state.sort === "priceAsc") return a.price - b.price;
      if (state.sort === "priceDesc") return b.price - a.price;
      if (state.sort === "rating") return b.rating - a.rating;
      if (state.sort === "new") return Number(b.isNew) - Number(a.isNew) || b.popular - a.popular;
      return b.popular - a.popular;
    });
}

function renderTag(tag, className = "") {
  const classes = ["tag", className].filter(Boolean).join(" ");
  return `<span class="${classes}">${escapeHtml(tag)}</span>`;
}

function renderProductCard(product) {
  const isFavorite = state.favorites.has(product.id);
  const artClass = allowedArtClasses.has(product.art) ? product.art : "phone";
  const favoriteLabel = isFavorite ? "Убрать из избранного" : "Добавить в избранное";
  const meta = state.view === "favorites"
    ? `${product.line} · избранное`
    : `${product.line} · ${product.category} · рейтинг ${product.rating}`;

  const tags = product.tags
    .map((tag, index) => renderTag(tag, index === 1 ? "green" : product.sale ? "pink" : ""))
    .join("");
  const oldPrice = product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : "";
  const specs = product.specs.map((spec) => `<li>${escapeHtml(spec)}</li>`).join("");

  return `
    <article class="product-card">
      <div class="product-art" aria-hidden="true">
        <span class="device ${artClass}"></span>
      </div>
      <div class="product-info">
        <h3>${escapeHtml(product.name)}</h3>
        <div class="meta">${escapeHtml(meta)}</div>
        <div class="tags">${tags}</div>
        <ul class="specs">${specs}</ul>
      </div>
      <div class="product-side">
        <div class="price">${oldPrice}${formatPrice(product.price)}</div>
        <div class="card-actions">
          <button class="heart-btn ${isFavorite ? "active" : ""}" data-favorite="${product.id}" type="button" aria-label="${favoriteLabel}" title="${favoriteLabel}">♡</button>
          <button class="buy-btn" data-cart="${product.id}" type="button" ${product.inStock ? "" : "disabled"} aria-label="${product.inStock ? "Добавить в корзину" : "Товар доступен под заказ"}">
            ${product.inStock ? "В корзину" : "Под заказ"}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  const list = getFilteredProducts();
  const countText = `${list.length} ${plural(list.length, ["товар", "товара", "товаров"])}`;

  elements.resultCount.textContent = state.view === "favorites" ? `${countText} в избранном` : countText;
  elements.favoritesButton.classList.toggle("active", state.view === "favorites");
  elements.favoritesButton.setAttribute("aria-pressed", String(state.view === "favorites"));
  elements.favoritesButton.setAttribute(
    "aria-label",
    state.view === "favorites" ? "Вернуться в каталог" : "Показать избранное"
  );

  if (!list.length) {
    elements.grid.innerHTML = `<div class="empty-state">${getEmptyMessage()}</div>`;
    return;
  }

  elements.grid.innerHTML = list.map(renderProductCard).join("");
}

function getEmptyMessage() {
  if (state.view === "favorites" && !state.favorites.size) {
    return "В избранном пока пусто.";
  }

  if (state.view === "favorites") {
    return "В избранном нет товаров под выбранные фильтры.";
  }

  return "Ничего не найдено. Попробуйте изменить фильтры.";
}

function renderCounters() {
  elements.favoriteCount.textContent = state.favorites.size;
  elements.cartCount.textContent = getCartEntries().reduce((sum, item) => sum + item.quantity, 0);
  saveStorage("maclineFavorites", [...state.favorites]);
  saveStorage("maclineCart", state.cart);
}

function renderCart() {
  const entries = getCartEntries();

  if (!entries.length) {
    elements.cartItems.innerHTML = '<div class="empty-state">Корзина пока пуста.</div>';
    elements.cartTotal.textContent = formatPrice(0);
    return;
  }

  let total = 0;
  elements.cartItems.innerHTML = entries.map(({ product, quantity }) => {
    total += product.price * quantity;

    return `
      <div class="cart-item">
        <div>
          <b>${escapeHtml(product.name)}</b>
          <span>${formatPrice(product.price)}</span>
        </div>
        <div class="qty" aria-label="Количество">
          <button data-qty="${product.id}" data-delta="-1" type="button" aria-label="Уменьшить количество">−</button>
          <strong>${quantity}</strong>
          <button data-qty="${product.id}" data-delta="1" type="button" aria-label="Увеличить количество">+</button>
        </div>
      </div>
    `;
  }).join("");

  elements.cartTotal.textContent = formatPrice(total);
}

function renderCheckoutSummary() {
  const entries = getCartEntries();
  const total = entries.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);

  elements.checkoutSummary.innerHTML = `
    <b>Ваш заказ</b>
    <ul>
      ${entries.map(({ product, quantity }) => `
        <li>
          <span>${escapeHtml(product.name)} × ${quantity}</span>
          <strong>${formatPrice(product.price * quantity)}</strong>
        </li>
      `).join("")}
    </ul>
    <div>
      <span>Итого</span>
      <strong>${formatPrice(total)}</strong>
    </div>
  `;
}

function renderProfile() {
  if (!state.user) {
    elements.profileText.textContent = "Войти";
    elements.profileInitial.textContent = "В";
    elements.nameInput.value = "";
    elements.emailInput.value = "";
    return;
  }

  elements.profileText.textContent = state.user.name;
  elements.profileInitial.textContent = state.user.name.slice(0, 1).toUpperCase();
  elements.nameInput.value = state.user.name;
  elements.emailInput.value = state.user.email;
}

function plural(number, words) {
  const last = number % 10;
  const lastTwo = number % 100;

  if (last === 1 && lastTwo !== 11) return words[0];
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return words[1];
  return words[2];
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove("show"), 2400);
}

function setCatalogView(view) {
  state.view = view;
  renderProducts();
}

function openLayer(id) {
  const layer = document.querySelector(`#${id}`);
  if (!layer) return;

  state.lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  state.activeLayer = id;
  layer.classList.add("open");
  layer.setAttribute("aria-hidden", "false");
  document.body.classList.add("layer-open");
  setExpandedState(id, true);

  const dialog = layer.querySelector('[role="dialog"]') || layer;
  const focusTarget = layer.querySelector("[autofocus]") || layer.querySelector(focusableSelector) || dialog;
  window.requestAnimationFrame(() => focusTarget.focus());
}

function closeLayer(id, options = {}) {
  const { restoreFocus = true } = options;
  const layer = document.querySelector(`#${id}`);
  if (!layer) return;

  layer.classList.remove("open");
  layer.setAttribute("aria-hidden", "true");
  setExpandedState(id, false);

  if (state.activeLayer === id) {
    state.activeLayer = null;
  }

  if (!document.querySelector(".drawer.open, .modal.open")) {
    document.body.classList.remove("layer-open");
  }

  if (restoreFocus && state.lastFocused && document.contains(state.lastFocused)) {
    state.lastFocused.focus();
  }
}

function setExpandedState(layerId, isOpen) {
  if (layerId === "cartDrawer") {
    elements.cartButton.setAttribute("aria-expanded", String(isOpen));
  }

  if (layerId === "authModal") {
    elements.loginButton.setAttribute("aria-expanded", String(isOpen));
  }
}

function trapFocus(event, layer) {
  const focusable = [...layer.querySelectorAll(focusableSelector)]
    .filter((element) => element.offsetParent !== null);

  if (!focusable.length) {
    event.preventDefault();
    (layer.querySelector('[role="dialog"]') || layer).focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function closeActiveLayer() {
  const layer = document.querySelector(".drawer.open, .modal.open");
  if (layer) closeLayer(layer.id);
}

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = elements.searchInput.value;
  state.quickCategory = elements.categoryQuick.value;
  renderProducts();
});

elements.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderProducts();
});

elements.categoryQuick.addEventListener("change", (event) => {
  state.quickCategory = event.target.value;
  renderProducts();
});

elements.sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});

elements.filters.addEventListener("change", renderProducts);

elements.resetFilters.addEventListener("click", () => {
  document.querySelectorAll('.filters input[type="checkbox"]').forEach((input) => {
    input.checked = false;
  });
  document.querySelector('input[name="price"][value="all"]').checked = true;
  renderProducts();
});

elements.grid.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  const cartButton = event.target.closest("[data-cart]");

  if (favoriteButton) {
    const id = Number(favoriteButton.dataset.favorite);

    if (state.favorites.has(id)) {
      state.favorites.delete(id);
      showToast("Удалено из избранного");
    } else {
      state.favorites.add(id);
      showToast("Добавлено в избранное");
    }

    renderCounters();
    renderProducts();
  }

  if (cartButton) {
    const id = Number(cartButton.dataset.cart);
    state.cart[id] = (state.cart[id] || 0) + 1;
    renderCounters();
    renderCart();
    showToast("Товар добавлен в корзину");
  }
});

elements.cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-qty]");
  if (!button) return;

  const id = Number(button.dataset.qty);
  const delta = Number(button.dataset.delta);
  state.cart[id] += delta;

  if (state.cart[id] <= 0) {
    delete state.cart[id];
  }

  renderCounters();
  renderCart();
});

elements.cartButton.addEventListener("click", () => {
  renderCart();
  openLayer("cartDrawer");
});

elements.favoritesButton.addEventListener("click", () => {
  const nextView = state.view === "favorites" ? "catalog" : "favorites";
  setCatalogView(nextView);

  if (nextView === "favorites" && !state.favorites.size) {
    showToast("В избранном пока пусто");
  }
});

document.querySelector('.nav a[href="#catalog"]').addEventListener("click", () => {
  setCatalogView("catalog");
});

elements.loginButton.addEventListener("click", () => {
  renderProfile();
  openLayer("authModal");
});

elements.authForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = elements.nameInput.value.trim();
  const email = elements.emailInput.value.trim();

  if (!name || !email) {
    showToast("Заполните имя и email");
    return;
  }

  state.user = { name, email };
  saveStorage("maclineUser", state.user);
  renderProfile();
  closeLayer("authModal", { restoreFocus: false });

  if (state.pendingCheckout && getCartEntries().length) {
    state.pendingCheckout = false;
    renderCheckoutSummary();
    openLayer("checkoutModal");
    showToast("Теперь можно подтвердить заказ");
    return;
  }

  showToast(`Здравствуйте, ${name}`);
});

elements.checkoutButton.addEventListener("click", () => {
  if (!getCartEntries().length) {
    showToast("Добавьте товары перед оформлением");
    return;
  }

  if (!state.user) {
    state.pendingCheckout = true;
    closeLayer("cartDrawer", { restoreFocus: false });
    openLayer("authModal");
    showToast("Войдите, чтобы оформить заказ");
    return;
  }

  renderCheckoutSummary();
  closeLayer("cartDrawer", { restoreFocus: false });
  openLayer("checkoutModal");
});

elements.checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const phone = elements.phoneInput.value.trim();
  const address = elements.addressInput.value.trim();

  if (!phone || !address) {
    showToast("Заполните телефон и адрес");
    return;
  }

  const orderNumber = `ML-${Date.now().toString().slice(-6)}`;
  state.cart = {};
  state.pendingCheckout = false;
  renderCounters();
  renderCart();
  renderProducts();
  elements.checkoutForm.reset();
  closeLayer("checkoutModal", { restoreFocus: false });
  showToast(`Заказ ${orderNumber} оформлен. Менеджер свяжется с вами.`);
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => closeLayer(button.dataset.close));
});

document.querySelectorAll(".drawer, .modal").forEach((layer) => {
  layer.addEventListener("click", (event) => {
    if (event.target === layer) {
      closeLayer(layer.id);
    }
  });
});

document.addEventListener("keydown", (event) => {
  const layer = document.querySelector(".drawer.open, .modal.open");
  if (!layer) return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeActiveLayer();
  }

  if (event.key === "Tab") {
    trapFocus(event, layer);
  }
});

renderProfile();
renderCounters();
renderCart();
renderProducts();
