// login.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!username || !password) {
      msg.textContent = "Please enter both Customer ID and password.";
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        msg.textContent = data.message || "Login failed.";
        return;
      }

      msg.textContent = "Login successful. Redirecting...";
      // JWT is set in the session cookie by the server
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 600);
    } catch (err) {
      console.error(err);
      msg.textContent = "Network error. Please try again.";
    }
  });
});
// login.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!username || !password) {
      msg.textContent = "Please enter both Customer ID and password.";
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        msg.textContent = data.message || "Login failed.";
        return;
      }

      msg.textContent = "Login successful. Redirecting...";
      // JWT is set in the session cookie by the server
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 600);
    } catch (err) {
      console.error(err);
      msg.textContent = "Network error. Please try again.";
    }
  });
});
