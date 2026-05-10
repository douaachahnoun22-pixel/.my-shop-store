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

function calculateTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  return { subtotal, total: subtotal + 12 };
}

function updateCartList() {
  const list = document.getElementById('cartItems');
  const empty = document.getElementById('emptyCart');
  const items = getCartItems();
  if (!list) return;
  if (!items.length) {
    list.innerHTML = '';
    if (empty) empty.style.display = 'block';
    document.getElementById('subtotalValue').textContent = '$0.00';
    document.getElementById('totalValue').textContent = '$0.00';
    return;
  }
  if (empty) empty.style.display = 'none';
  list.innerHTML = items.map((item, index) => `
    <div class="cart-item">
      <img src="${item.image_url}" alt="${item.name}" />
      <div class="cart-item-content">
        <div class="cart-item-heading">
          <h3>${item.name}</h3>
          <span class="price-tag">$${item.unit_price.toFixed(2)}</span>
        </div>
        <p>Quantity</p>
        <div class="quantity-control">
          <input type="number" min="1" value="${item.quantity}" onchange="changeQuantity(${index}, this.value)" />
          <button class="button button-secondary remove-button" onclick="removeItem(${index})">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
  const totals = calculateTotals(items);
  document.getElementById('subtotalValue').textContent = `$${totals.subtotal.toFixed(2)}`;
  document.getElementById('totalValue').textContent = `$${totals.total.toFixed(2)}`;
}

function changeQuantity(index, value) {
  const cart = getCartItems();
  cart[index].quantity = Math.max(1, Number(value) || 1);
  setCartItems(cart);
  updateCartList();
}

function removeItem(index) {
  const cart = getCartItems();
  cart.splice(index, 1);
  setCartItems(cart);
  updateCartList();
  showToast('Item removed from cart.');
}

function proceedToCheckout() {
  window.location.href = 'checkout.html';
}

function renderCheckoutPreview() {
  const preview = document.getElementById('orderPreview');
  const cart = getCartItems();
  if (!preview) return;
  if (!cart.length) {
    preview.innerHTML = '<p class="empty-state">Your cart is empty. Add items before checkout.</p>';
    return;
  }
  const rows = cart.map((item) => `
    <div class="preview-row">
      <span>${item.name} x ${item.quantity}</span>
      <span>$${(item.unit_price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');
  preview.innerHTML = rows;
  const totals = calculateTotals(cart);
  document.getElementById('checkoutTotal').textContent = `$${totals.total.toFixed(2)}`;
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('luxuryShopUser') || 'null');
}

async function submitCheckout(event) {
  event.preventDefault();
  const cart = getCartItems();
  if (!cart.length) {
    showToast('Cart is empty.');
    return;
  }
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login before checkout.');
    setTimeout(() => window.location.href = 'login.html', 800);
    return;
  }

  const email = document.getElementById('checkoutEmail').value.trim();
  const phone = document.getElementById('checkoutPhone').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();
  const comments = document.getElementById('checkoutComments').value.trim();

  if (!email || !phone || !address) {
    showToast('Please complete your shipping details.');
    return;
  }
  const totals = calculateTotals(cart);
  const response = await fetch(`${apiBase}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: user.id,
      user_name: user.name,
      email,
      phone,
      address,
      comments,
      items: cart,
      total: totals.total,
    }),
  });
  const result = await response.json();
  if (result.status !== 'success') {
    showToast(result.message || 'Unable to complete checkout.');
    return;
  }
  localStorage.removeItem('luxuryShopCart');
  showToast('Order placed successfully!');
  setTimeout(() => window.location.href = 'index.html', 1100);
}

window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cartItems')) {
    updateCartList();
    document.getElementById('checkoutButton').addEventListener('click', proceedToCheckout);
  }
  if (document.getElementById('checkoutForm')) {
    renderCheckoutPreview();
    const user = getCurrentUser();
    if (user) {
      document.getElementById('checkoutEmail').value = user.email;
      document.getElementById('checkoutPhone').value = user.phone;
    }
    document.getElementById('checkoutForm').addEventListener('submit', submitCheckout);
  }
});
