const apiBase = '/api';

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toast.timeoutId);
  toast.timeoutId = window.setTimeout(() => toast.classList.remove('show'), 2800);
}

function fromJson(response) {
  return response.json();
}

async function fetchProducts() {
  const response = await fetch(`${apiBase}/products`);
  const data = await fromJson(response);
  return data.data || [];
}

function mapProductCard(product) {
  return `
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
  `;
}

function getCartItems() {
  return JSON.parse(localStorage.getItem('luxuryShopCart') || '[]');
}

function setCartItems(items) {
  localStorage.setItem('luxuryShopCart', JSON.stringify(items));
}

async function addToCart(productId) {
  const products = await fetchProducts();
  const product = products.find((item) => item.id === productId);
  if (!product) {
    showToast('Product not found.');
    return;
  }
  const cart = getCartItems();
  const existing = cart.find((item) => item.product_id === product.id);
  if (existing) {
    existing.quantity += 1;
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
  showToast('Added to cart successfully.');
}

function fillFeaturedProducts(products) {
  const container = document.getElementById('featuredList');
  if (!container) return;
  const featured = products.filter((product) => product.best_seller).slice(0, 4);
  container.innerHTML = featured.map(mapProductCard).join('');
}

function initSearch() {
  const searchInput = document.getElementById('homeSearch');
  const searchButton = document.getElementById('searchSubmit');
  if (!searchInput || !searchButton) return;

  searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;
    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
  });
}

function initSlider() {
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  if (!slides.length) return;
  let index = 0;
  setInterval(() => {
    slides[index].classList.remove('active');
    index = (index + 1) % slides.length;
    slides[index].classList.add('active');
  }, 5200);
}

async function decorateHome() {
  initSearch();
  initSlider();
  const products = await fetchProducts();
  fillFeaturedProducts(products);
}

function getParameterByName(name) {
  const url = window.location.search;
  const params = new URLSearchParams(url);
  return params.get(name);
}

async function loadProductDetail() {
  const productId = getParameterByName('id');
  if (!productId) return;
  const response = await fetch(`${apiBase}/products/${productId}`);
  const data = await fromJson(response);
  if (!data.data) {
    showToast('Product not found.');
    return;
  }
  const product = data.data;
  document.getElementById('productCategory').textContent = product.category;
  document.getElementById('productName').textContent = product.name;
  document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
  document.getElementById('productDescription').textContent = product.description;
  document.getElementById('productRating').textContent = `⭐ ${product.rating}`;
  document.getElementById('productReviews').textContent = `${product.reviews_count} reviews`;
  const gallery = document.getElementById('galleryContainer');
  if (gallery) {
    const mainImage = product.gallery[0] || product.image_url;
    gallery.innerHTML = `
      <div class="gallery-main" style="background-image:url('${mainImage}')"></div>
      <div class="gallery-thumbs">${product.gallery.map((url) => `<button type="button"><img src="${url.trim()}" alt="gallery" /></button>`).join('')}</div>
    `;
  }

  document.getElementById('addToCartButton').addEventListener('click', () => addToCart(product.id));
  document.getElementById('buyNowButton').addEventListener('click', async () => {
    await addToCart(product.id);
    window.location.href = 'cart.html';
  });
  fillSuggestions(product.category, product.id);
}

async function fillSuggestions(category, excludeId) {
  const response = await fetch(`${apiBase}/products`);
  const data = await fromJson(response);
  const suggestions = (data.data || [])
    .filter((item) => item.category === category && item.id !== Number(excludeId))
    .slice(0, 3);
  const container = document.getElementById('suggestions');
  if (container) {
    container.innerHTML = suggestions.map((product) => `
      <article class="suggestion-card">
        <img src="${product.image_url}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>$${product.price.toFixed(2)}</p>
        <button class="button button-secondary" onclick="window.location.href='product.html?id=${product.id}'">View</button>
      </article>
    `).join('');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (document.body.contains(document.getElementById('featuredList'))) {
    decorateHome();
  }
  if (document.body.contains(document.getElementById('productName'))) {
    loadProductDetail();
  }
});
