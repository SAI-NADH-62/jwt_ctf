// signup.js — updated to work with cookie-based backend authentication
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const msg = document.getElementById('signupMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';

    const name = document.getElementById('signup-name').value.trim();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (!name || !username || !password) {
      msg.textContent = 'Please fill all fields.';
      return;
    }

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        credentials: 'include', // Important: include cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password })
      });

      const data = await res.json();

      if (res.ok) {
        msg.textContent = 'Account created. Redirecting to dashboard...';
        setTimeout(() => window.location.href = 'dashboard.html', 500);
      } else {
        msg.textContent = data.message || 'Signup failed';
      }
    } catch (err) {
      console.error(err);
      msg.textContent = 'Network error. Please try again.';
    }
  });
});