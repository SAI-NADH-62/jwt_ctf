// dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  const userDisplay = document.getElementById("userDisplay");
  const logoutBtn = document.getElementById("logoutBtn");
  const contentArea = document.getElementById("contentArea");

  const overviewBtn = document.getElementById("overviewBtn");
  const cardsBtn = document.getElementById("cardsBtn");
  const paymentsBtn = document.getElementById("paymentsBtn");
  const adminBtn = document.getElementById("adminBtn");

  let currentUser = null;

  function setActive(btn) {
    [overviewBtn, cardsBtn, paymentsBtn, adminBtn].forEach((b) =>
      b.classList.remove("active")
    );
    btn.classList.add("active");
  }

  function renderOverview() {
    if (!currentUser) return;
    contentArea.innerHTML = `
      <h2>Accounts overview</h2>
      <p class="muted-text">
        Good evening, <strong>${currentUser.sub}</strong>. Below are your CyberHawks demo account balances.
      </p>

      <div class="account-cards">
        <div class="account-card">
          <div class="account-label">Savings Account</div>
          <div class="account-balance">₹ 1,24,500.80</div>
          <div class="account-meta">Account ending • 4821</div>
        </div>

        <div class="account-card">
          <div class="account-label">Current Account</div>
          <div class="account-balance">₹ 36,210.15</div>
          <div class="account-meta">Account ending • 9304</div>
        </div>

        <div class="account-card">
          <div class="account-label">Fixed Deposit</div>
          <div class="account-balance">₹ 2,50,000.00</div>
          <div class="account-meta">Link ID • CHFD-0193</div>
        </div>

        <div class="account-card">
          <div class="account-label">Goal Saver – CyberHawks CTF Trip</div>
          <div class="account-balance">₹ 18,750.00</div>
          <div class="account-meta">Target: ₹ 50,000 • 37% complete</div>
        </div>
      </div>

      <p class="muted-text">
        Note: all balances and account numbers here are randomly generated for training and have no real value.
      </p>
    `;
  }

  function renderCards() {
    contentArea.innerHTML = `
      <h2>Cards</h2>
      <p class="muted-text">
        Cards linked to your CyberHawks demo profile.
      </p>

      <div class="account-cards">
        <div class="account-card">
          <div class="account-label">CyberHawks Platinum Debit</div>
          <div class="account-balance">•••• 5213</div>
          <div class="account-meta">Daily limit: ₹ 50,000 • Contactless: Enabled</div>
        </div>
        <div class="account-card">
          <div class="account-label">CyberHawks Rewards Credit</div>
          <div class="account-balance">•••• 9910</div>
          <div class="account-meta">Available limit: ₹ 75,000 • Reward points: 12,340</div>
        </div>
        <div class="account-card">
          <div class="account-label">Virtual Card (Online only)</div>
          <div class="account-balance">•••• 3078</div>
          <div class="account-meta">Temporary CVV • Lock/unlock from app</div>
        </div>
      </div>
    `;
  }

  function renderPayments() {
    contentArea.innerHTML = `
      <h2>Payments history</h2>
      <p class="muted-text">Recent transactions (demo data only)</p>

      <table class="tx-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Details</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>2025-11-04</td><td>UPI • Food Delivery</td><td>Success</td><td>- ₹ 650.00</td></tr>
          <tr><td>2025-11-05</td><td>UPI • Ride Sharing</td><td>Success</td><td>- ₹ 320.00</td></tr>
          <tr><td>2025-11-06</td><td>ATM Withdrawal</td><td>Success</td><td>- ₹ 4,000.00</td></tr>
          <tr><td>2025-11-07</td><td>CyberHawks CTF Registration</td><td>Success</td><td>- ₹ 499.00</td></tr>
          <tr><td>2025-11-08</td><td>Online Purchase • Headphones</td><td>Success</td><td>- ₹ 2,999.00</td></tr>
          <tr><td>2025-11-09</td><td>Electricity Bill</td><td>Success</td><td>- ₹ 1,780.00</td></tr>
          <tr><td>2025-11-10</td><td>Credit Card Payment</td><td>Success</td><td>- ₹ 8,500.00</td></tr>
          <tr><td>2025-11-11</td><td>UPI • Grocery Store</td><td>Success</td><td>- ₹ 1,250.00</td></tr>
          <tr><td>2025-11-12</td><td>Salary – CyberHawks</td><td>Success</td><td>+ ₹ 55,000.00</td></tr>
          <tr><td>2025-11-13</td><td>Netflix Subscription</td><td>Success</td><td>- ₹ 649.00</td></tr>
        </tbody>
      </table>
    `;
  }

  function renderAdminDenied(message) {
    contentArea.innerHTML = `
      <h2>Fraud & Risk Console</h2>
      <p class="muted-text">
        ${message || "Access denied. Only authorized bank admins can view risk events."}
      </p>
      <p class="muted-text">
        The API uses a JSON Web Token (JWT) to decide your <code>role</code>.
        Try intercepting the request to <code>/api/admin</code> and look at the JWT payload.
      </p>
      <p class="muted-text">
        Hint: your current role is <strong>${currentUser ? currentUser.role : "unknown"}</strong>.
        What happens if the token claims <code>admin</code> instead?
      </p>
    `;
  }

  function renderAdminFlag(flag, message) {
    contentArea.innerHTML = `
      <h2>Fraud & Risk Console <span class="chip">admin</span></h2>
      <p>${message}</p>

      <div class="flag-box">
        Flag: ${flag}
      </div>

      <p class="muted-text">
        You abused the server's trust in the <code>role</code> field of the JWT.
        The backend never re-checks your actual permissions – classic auth bypass.
      </p>
    `;
  }

  async function loadUser() {
    try {
      const res = await fetch("/api/me");
      if (!res.ok) {
        window.location.href = "index.html";
        return;
      }
      const data = await res.json();
      currentUser = data.user;
      userDisplay.textContent = `${currentUser.sub} • role: ${currentUser.role}`;
      setActive(overviewBtn);
      renderOverview();
    } catch (err) {
      console.error(err);
      window.location.href = "index.html";
    }
  }

  overviewBtn.addEventListener("click", () => {
    setActive(overviewBtn);
    renderOverview();
  });

  cardsBtn.addEventListener("click", () => {
    setActive(cardsBtn);
    renderCards();
  });

  paymentsBtn.addEventListener("click", () => {
    setActive(paymentsBtn);
    renderPayments();
  });

  adminBtn.addEventListener("click", async () => {
    setActive(adminBtn);
    if (!currentUser) {
      renderAdminDenied("You must sign in first.");
      return;
    }

    try {
      const res = await fetch("/api/admin");
      const data = await res.json();

      if (!res.ok) {
        renderAdminDenied(data.message || "Forbidden.");
      } else {
        renderAdminFlag(data.flag, data.message);
      }
    } catch (err) {
      console.error(err);
      renderAdminDenied("Network error while contacting admin API.");
    }
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/api/logout");
    } catch (_) {}
    window.location.href = "index.html";
  });

  loadUser();
});
