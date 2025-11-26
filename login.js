// login.js — updated to work with cookie-based backend authentication
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('loginMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!username || !password) {
      msg.textContent = 'Please enter both Customer ID and password.';
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include', // Important: include cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        msg.textContent = 'Login successful. Redirecting...';
        setTimeout(() => window.location.href = 'dashboard.html', 400);
      } else {
        msg.textContent = data.message || 'Login failed';
      }
    } catch (err) {
      console.error(err);
      msg.textContent = 'Network error. Please try again.';
    }
  });
});