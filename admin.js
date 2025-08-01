const API_URL = 'https://arzonshop.onrender.com/api/products';
const ADMIN_PASS = 'admin123'; // Пример пароля

// --- SPA роутинг админки ---
window.addEventListener('popstate', renderAdminRoute);
function goToAdmin(route) {
  history.pushState({}, '', route);
  renderAdminRoute();
}

// --- Авторизация ---
function renderLogin() {
  const main = document.getElementById('admin-main');
  main.innerHTML = `
    <form id="login-form">
      <input type="password" placeholder="Пароль" required>
      <button type="submit">Войти</button>
    </form>
  `;
  document.getElementById('login-form').onsubmit = e => {
    e.preventDefault();
    const pass = e.target[0].value;
    if (pass === ADMIN_PASS) {
      localStorage.setItem('admin_token', 'ok');
      goToAdmin('/admin/products');
    } else {
      showToast('Неверный пароль');
    }
  };
}

// --- Рендер роутов ---
function renderAdminRoute() {
  const token = localStorage.getItem('admin_token');
  const path = location.pathname;
  if (!token) {
    renderLogin();
    return;
  }
  if (path === '/admin' || path === '/admin/products') {
    renderAdminProducts();
  } else if (path === '/admin/add') {
    renderAddProduct();
  } else if (path.startsWith('/admin/edit/')) {
    const id = path.split('/admin/edit/')[1];
    renderEditProduct(id);
  } else {
    document.getElementById('admin-main').innerHTML = '<h2>Страница не найдена</h2>';
  }
}

// --- Список товаров ---
async function renderAdminProducts() {
  const res = await fetch(API_URL);
  const products = await res.json();
  const list = document.createElement('div');
  list.className = 'admin-list';
  products.forEach(p => {
    const item = document.createElement('div');
    item.className = 'admin-item';
    item.innerHTML = `
      <img src="${p.image}" width="50" height="50">
      <span>${p.title}</span>
      <span>${p.price} ₽</span>
      <button onclick="goToAdmin('/admin/edit/${p.id}')">Редактировать</button>
      <button onclick="confirmDelete(${p.id})">Удалить</button>
    `;
    list.appendChild(item);
  });
  document.getElementById('admin-main').innerHTML = `<button onclick="goToAdmin('/admin/add')">Добавить товар</button>`;
  document.getElementById('admin-main').appendChild(list);
}

// --- Добавление товара ---
function renderAddProduct() {
  document.getElementById('admin-main').innerHTML = `
    <form id="add-form" enctype="multipart/form-data">
      <input name="title" placeholder="Название" required>
      <input name="price" type="number" placeholder="Цена" required>
      <input name="description" placeholder="Описание" required>
      <input name="category" placeholder="Категория">
      <input name="image" type="file" accept="image/*" required>
      <button type="submit">Добавить</button>
    </form>
  `;
  document.getElementById('add-form').onsubmit = async e => {
    e.preventDefault();
    const form = new FormData(e.target);
    const res = await fetch(API_URL, {
      method: 'POST',
      body: form
    });
    if (res.ok) {
      showToast('Товар добавлен');
      goToAdmin('/admin/products');
    } else {
      showToast('Ошибка добавления');
    }
  };
}

// --- Редактирование товара ---
async function renderEditProduct(id) {
  const res = await fetch(API_URL);
  const products = await res.json();
  const product = products.find(p => p.id == id);
  if (!product) {
    showToast('Товар не найден');
    return;
  }
  document.getElementById('admin-main').innerHTML = `
    <form id="edit-form" enctype="multipart/form-data">
      <input name="title" value="${product.title}" required>
      <input name="price" type="number" value="${product.price}" required>
      <input name="description" value="${product.description}" required>
      <input name="category" value="${product.category}">
      <input name="image" type="file" accept="image/*">
      <button type="submit">Сохранить</button>
    </form>
  `;
  document.getElementById('edit-form').onsubmit = async e => {
    e.preventDefault();
    const form = new FormData(e.target);
    const res = await fetch(API_URL + '/' + id, {
      method: 'PUT',
      body: form
    });
    if (res.ok) {
      showToast('Товар обновлен');
      goToAdmin('/admin/products');
    } else {
      showToast('Ошибка обновления');
    }
  };
}

// --- Удаление товара ---
function confirmDelete(id) {
  showModal('Удалить товар?', async () => {
    const res = await fetch(API_URL + '/' + id, { method: 'DELETE' });
    if (res.ok) {
      showToast('Товар удален');
      goToAdmin('/admin/products');
    } else {
      showToast('Ошибка удаления');
    }
  });
}

// --- Toast уведомления ---
function showToast(msg) {
  let toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// --- Модальное окно ---
function showModal(msg, onConfirm) {
  let modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<div class="modal-content"><p>${msg}</p><button id="yes">Да</button> <button id="no">Нет</button></div>`;
  document.body.appendChild(modal);
  document.getElementById('yes').onclick = () => { modal.remove(); onConfirm(); };
  document.getElementById('no').onclick = () => modal.remove();
}

// --- Инициализация ---
renderAdminRoute();
