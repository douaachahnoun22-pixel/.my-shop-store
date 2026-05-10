const apiBase = '/api';

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toast.timeoutId);
  toast.timeoutId = window.setTimeout(() => toast.classList.remove('show'), 2800);
}

function getCartItems() {
  return JSON.parse(localStorage.getItem('luxuryShopCart') || '[]');
}

function setCartItems(cart) {
  localStorage.setItem('luxuryShopCart', JSON.stringify(cart));
}

function addToCart(productId) {
  const product = window.allProducts.find((item) => item.id === productId);
  if (!product) {
    showToast('Cannot add product.');
    return;
  }
  const cart = getCartItems();
  const exists = cart.find((item) => item.product_id === product.id);
  if (exists) {
    exists.quantity += 1;
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      image_url: product.image_url,
      unit_price: product.price,
      quantity: 1,
    });
  }
  setCartItems(cart);
  showToast('Added to cart.');
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  if (!products.length) {
    grid.innerHTML = '<div class="empty-state">No products match your filters.</div>';
    return;
  }
  grid.innerHTML = products.map((product) => `
    <article class="product-card">
      <img src="${product.image_url}" alt="${product.name}" />
      <div class="product-meta">
        <span>${product.category}</span>
        <span class="price-tag">$${product.price.toFixed(2)}</span>
      </div>
      <h3>${product.name}</h3>
      <p>${product.description.slice(0, 100)}...</p>
      <div class="product-actions">
        <a class="button button-secondary" href="product.html?id=${product.id}">View Details</a>
        <button class="button button-primary" onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    </article>
  `).join('');
}

async function loadProducts() {
  const response = await fetch(`${apiBase}/products`);
  const result = await response.json();
  const products = result.data || [];
  window.allProducts = products;
  const query = new URLSearchParams(window.location.search).get('search');
  if (query) {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) || product.description.toLowerCase().includes(query.toLowerCase())
    );
    renderProducts(filtered);
  } else {
    renderProducts(products);
  }
}

async function applyFilters() {
  const minPrice = Number(document.getElementById('priceMin').value || 0);
  const maxPrice = Number(document.getElementById('priceMax').value || 9999);
  const category = document.getElementById('categoryFilter').value;
  const bestSeller = document.getElementById('bestSellerFilter').checked;

  const response = await fetch(`${apiBase}/products/filter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      min_price: minPrice,
      max_price: maxPrice,
      category,
      best_seller: bestSeller,
    }),
  });
  const result = await response.json();
  if (result.status !== 'success') {
    showToast('Unable to apply filters.');
    return;
  }
  renderProducts(result.data || []);
}

window.addEventListener('DOMContentLoaded', () => {
  const applyButton = document.getElementById('applyFilters');
  if (applyButton) {
    applyButton.addEventListener('click', applyFilters);
  }
  if (document.getElementById('productsGrid')) {
    loadProducts();
  }
});
