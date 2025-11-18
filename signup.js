// signup.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  const msg = document.getElementById("signupMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const name = document.getElementById("signup-name").value.trim();
    const username = document.getElementById("signup-username").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    if (!name || !username || !password) {
      msg.textContent = "Please fill all fields.";
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        msg.textContent = data.message || "Signup failed.";
        return;
      }

      msg.textContent = "Account created. Redirecting to dashboard...";
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 700);
    } catch (err) {
      console.error(err);
      msg.textContent = "Network error. Please try again.";
    }
  });
});
