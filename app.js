// --- Конфиг API ---
const API_URL = 'https://arzonshop.onrender.com/api/products';

// --- SPA роутинг ---
window.addEventListener('popstate', renderRoute);
function goTo(route) {
  history.pushState({}, '', route);
  renderRoute();
}

// --- Главный рендер ---
async function renderRoute() {
  const main = document.getElementById('main-content');
  const path = location.pathname;
  if (path === '/' || path === '/index.html') {
    main.innerHTML = '<div id="catalog"></div>';
    renderCatalog();
  } else if (path.startsWith('/product/')) {
    const id = path.split('/product/')[1];
    main.innerHTML = '<div id="product-page"></div>';
    renderProduct(id);
  } else {
    main.innerHTML = '<h2>Страница не найдена</h2>';
  }
}

// --- Каталог товаров ---
async function renderCatalog() {
  const res = await fetch(API_URL);
  const products = await res.json();
  const grid = document.createElement('div');
  grid.className = 'catalog-grid';
  products.forEach(p => grid.appendChild(productCard(p)));
  document.getElementById('catalog').appendChild(grid);
  renderSearch(products);
}

// --- Карточка товара ---
function productCard(product) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="${product.image}" loading="lazy" alt="${product.title}">
    <div class="title">${product.title}</div>
    <div class="price">${product.price} ₽</div>
    <button onclick="goTo('/product/${product.id}')">Подробнее</button>
  `;
  return card;
}

// --- Страница товара ---
async function renderProduct(id) {
  const res = await fetch(API_URL);
  const products = await res.json();
  const product = products.find(p => p.id == id);
  if (!product) {
    document.getElementById('product-page').innerHTML = '<h2>Товар не найден</h2>';
    return;
  }
  document.getElementById('product-page').innerHTML = `
    <img src="${product.image}" style="width:100%;max-width:300px;" alt="${product.title}">
    <h2>${product.title}</h2>
    <div class="price">${product.price} ₽</div>
    <p>${product.description}</p>
    <button onclick="window.open('https://t.me/share/url?url='+location.href)">Написать в Telegram</button>
    <button onclick="window.open('https://wa.me/?text='+location.href)">Написать в WhatsApp</button>
    <button onclick="goTo('/')">Назад</button>
    <h3>Похожие товары</h3>
    <div id="similar"></div>
  `;
  renderSimilar(products, id);
}

// --- Похожие товары ---
function renderSimilar(products, id) {
  const others = products.filter(p => p.id != id);
  const random = others.sort(() => 0.5 - Math.random()).slice(0, 4);
  const grid = document.createElement('div');
  grid.className = 'catalog-grid';
  random.forEach(p => grid.appendChild(productCard(p)));
  document.getElementById('similar').appendChild(grid);
}

// --- Поиск ---
function renderSearch(products) {
  const searchDiv = document.getElementById('search');
  searchDiv.innerHTML = '<input id="search-input" placeholder="Поиск...">';
  document.getElementById('search-input').addEventListener('input', e => {
    const val = e.target.value.toLowerCase();
    const filtered = products.filter(p => p.title.toLowerCase().includes(val));
    const grid = document.querySelector('.catalog-grid');
    grid.innerHTML = '';
    filtered.forEach(p => grid.appendChild(productCard(p)));
  });
}

// --- Telegram Mini App приветствие ---
if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
  const user = window.Telegram.WebApp.initDataUnsafe.user;
  document.querySelector('header').insertAdjacentHTML('beforeend', `<div>Привет, ${user.first_name}!</div>`);
}

// --- Инициализация ---
renderRoute();
