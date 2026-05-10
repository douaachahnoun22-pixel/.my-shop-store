const apiBase = '/api';

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toast.timeoutId);
  toast.timeoutId = window.setTimeout(() => toast.classList.remove('show'), 2800);
}

function setUserSession(user) {
  localStorage.setItem('luxuryShopUser', JSON.stringify(user));
  if (user.is_admin) {
    localStorage.setItem('luxuryShopAdminKey', 'admin-2026');
  }
}

async function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  if (!email || !password) {
    showToast('Please fill in both fields.');
    return;
  }
  const response = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const result = await response.json();
  if (result.status !== 'success') {
    showToast(result.message || 'Login failed.');
    return;
  }
  setUserSession(result.data);
  showToast('Welcome back! Redirecting...');
  setTimeout(() => {
    window.location.href = result.data.is_admin ? 'admin.html' : 'index.html';
  }, 900);
}

async function signUpUser(event) {
  event.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const phone = document.getElementById('signupPhone').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  const confirmPassword = document.getElementById('signupConfirmPassword').value.trim();

  if (!name || !email || !phone || !password || !confirmPassword) {
    showToast('All fields are required.');
    return;
  }
  if (password !== confirmPassword) {
    showToast('Passwords do not match.');
    return;
  }
  const response = await fetch(`${apiBase}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, password }),
  });
  const result = await response.json();
  if (result.status !== 'success') {
    showToast(result.message || 'Signup failed.');
    return;
  }
  setUserSession(result.data);
  showToast('Account created successfully.');
  setTimeout(() => window.location.href = 'index.html', 900);
}

window.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  if (loginForm) loginForm.addEventListener('submit', loginUser);
  if (signupForm) signupForm.addEventListener('submit', signUpUser);
});
