const apiBase = '/api';

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toast.timeoutId);
  toast.timeoutId = window.setTimeout(() => toast.classList.remove('show'), 2800);
}

function getAdminKey() {
  return localStorage.getItem('luxuryShopAdminKey');
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('luxuryShopUser') || 'null');
}

function requireAdmin() {
  const user = getCurrentUser();
  if (!user || !user.is_admin) {
    showToast('Admin access required. Please login with admin account.');
    setTimeout(() => window.location.href = 'login.html', 900);
    return false;
  }
  return true;
}

async function loadAdminProducts() {
  if (!requireAdmin()) return;
  const response = await fetch(`${apiBase}/admin/products`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await response.json();
  if (result.status !== 'success') {
    showToast(result.message || 'Unable to load products.');
    return;
  }
  const list = document.getElementById('adminList');
  if (!list) return;
  list.innerHTML = `
    <table>
      <thead>
        <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
      </thead>
      <tbody>
        ${result.data.map((product) => `
          <tr>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
              <button class="button button-secondary" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadOrders() {
  if (!requireAdmin()) return;
  const response = await fetch(`${apiBase}/admin/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_key: getAdminKey() }),
  });
  const result = await response.json();
  if (result.status !== 'success') {
    showToast(result.message || 'Unable to load orders.');
    return;
  }
  const list = document.getElementById('adminList');
  if (!list) return;
  list.innerHTML = `
    <table>
      <thead>
        <tr><th>Order</th><th>User</th><th>Total</th><th>Status</th></tr>
      </thead>
      <tbody>
        ${result.data.map((order) => `
          <tr>
            <td>#${order.id}</td>
            <td>${order.user_name}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td>${order.status}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadUsers() {
  if (!requireAdmin()) return;
  const response = await fetch(`${apiBase}/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_key: getAdminKey() }),
  });
  const result = await response.json();
  if (result.status !== 'success') {
    showToast(result.message || 'Unable to load users.');
    return;
  }
  const list = document.getElementById('adminList');
  if (!list) return;
  list.innerHTML = `
    <table>
      <thead>
        <tr><th>Name</th><th>Email</th><th>Phone</th><th>Admin</th></tr>
      </thead>
      <tbody>
        ${result.data.map((user) => `
          <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.is_admin ? 'Yes' : 'No'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadNotifications() {
  if (!requireAdmin()) return;
  const response = await fetch(`${apiBase}/admin/notifications`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await response.json();
  if (result.status !== 'success') {
    showToast(result.message || 'Unable to load notifications.');
    return;
  }
  const list = document.getElementById('adminList');
  if (!list) return;
  list.innerHTML = `
    <div class="notification-list">
      ${result.data.map((item) => `
        <div class="notification-card">
          <strong>${item.title}</strong>
          <p>${item.message}</p>
        </div>
      `).join('')}
    </div>
  `;
}

async function createProduct() {
  if (!requireAdmin()) return;
  const payload = {
    admin_key: getAdminKey(),
    name: document.getElementById('newName').value.trim(),
    category: document.getElementById('newCategory').value,
    price: Number(document.getElementById('newPrice').value || 0),
    image_url: document.getElementById('newImage').value.trim(),
    description: document.getElementById('newDescription').value.trim(),
    stock: Number(document.getElementById('newStock').value || 0),
    best_seller: document.getElementById('newBestSeller').checked,
    gallery: [],
  };
  if (!payload.name || !payload.image_url || payload.price <= 0) {
    showToast('Please fill product name, image and price.');
    return;
  }
  const response = await fetch(`${apiBase}/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (result.status !== 'success') {
    showToast(result.message || 'Unable to create product.');
    return;
  }
  showToast('Product added to inventory.');
  loadAdminProducts();
}

async function deleteProduct(productId) {
  if (!requireAdmin()) return;
  const response = await fetch(`${apiBase}/admin/products/${productId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_key: getAdminKey() }),
  });
  const result = await response.json();
  if (result.status !== 'success') {
    showToast(result.message || 'Unable to delete product.');
    return;
  }
  showToast('Product deleted successfully.');
  loadAdminProducts();
}

function logoutAdmin() {
  localStorage.removeItem('luxuryShopUser');
  localStorage.removeItem('luxuryShopAdminKey');
  window.location.href = 'login.html';
}

window.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('adminTableSection')) return;
  document.getElementById('loadProducts').addEventListener('click', loadAdminProducts);
  document.getElementById('loadOrders').addEventListener('click', loadOrders);
  document.getElementById('loadUsers').addEventListener('click', loadUsers);
  document.getElementById('loadNotifications').addEventListener('click', loadNotifications);
  document.getElementById('createProduct').addEventListener('click', createProduct);
  document.getElementById('adminLogout').addEventListener('click', logoutAdmin);
  loadAdminProducts();
});
