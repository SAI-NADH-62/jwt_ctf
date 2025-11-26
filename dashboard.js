// dashboard.js — updated to match dashboard.html structure (reads demo JWT from localStorage)
// (trimmed for brevity but functional)
(function () {
  'use strict';
  const sampleData = {
    balances: { savings: 124500.8, current: 36210.15, fd: 9700.98 },
    transactions: [
      { date: '2025-11-20', details: 'Salary – CyberHawks (Payroll)', status: 'Success', amount: 55000 },
      { date: '2025-11-19', details: 'UPI • Transfer • mom@upi', status: 'Pending', amount: -2500 },
      { date: '2025-11-18', details: 'Amazon • Home & Kitchen', status: 'Success', amount: -7626 },
      { date: '2025-11-17', details: 'Card charge • Unknown merchant', status: 'Failed', amount: -2999 },
      { date: '2025-11-15', details: 'UPI • office@upi (Reimbursement)', status: 'Success', amount: 15000 },
      { date: '2025-11-14', details: 'Netflix • Subscription (Standard)', status: 'Failed', amount: -649 },
      { date: '2025-11-12', details: 'Refund • Online retailer', status: 'Success', amount: 799 }
    ],
    monthlySpending: { labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'], expenses: [6400, 4200, 8800, 7200, 4800, 6500], income: [32000, 30000, 35000, 30000, 32000, 55000] },
    recipients: ['mom@upi', 'office@upi', 'friend@upi']
  };

  function parseJwtFromLocal() {
    try {
      const raw = localStorage.getItem('id_token');
      if (!raw) return null;
      const parts = raw.split('.');
      if (parts.length < 2) return null;
      return JSON.parse(atob(parts[1]));
    } catch (e) { return null; }
  }
  function numberWithCommas(x) { return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

  function showUserHeader(payload) {
    const pill = $('#userPill');
    const welcome = $('#welcomeName');
    if (!pill) return;
    if (payload && (payload.username || payload.sub)) {
      const name = payload.username || payload.sub;
      const role = payload.role || 'customer';
      pill.textContent = `${name} • role: ${role}`;
      if (welcome) welcome.textContent = name;
    } else {
      pill.textContent = 'Guest';
      if (welcome) welcome.textContent = 'Guest';
    }
  }

  function populateBalances() {
    $('#balSavings') && ($('#balSavings').textContent = numberWithCommas(sampleData.balances.savings.toFixed(2)));
    $('#balCurrent') && ($('#balCurrent').textContent = numberWithCommas(sampleData.balances.current.toFixed(2)));
    $('#balFD') && ($('#balFD').textContent = numberWithCommas(sampleData.balances.fd.toFixed(2)));
    $('#availSavings') && ($('#availSavings').textContent = '₹ ' + numberWithCommas(Math.round(sampleData.balances.savings)));
    $('#savingsPercent') && ($('#savingsPercent').textContent = Math.min(100, Math.round((sampleData.balances.savings / 200000) * 100)) + '%');
  }

  function populateTxTable(list) {
    const tbody = document.querySelector('#txTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    let running = Math.round(sampleData.balances.savings + sampleData.balances.current);
    (list || sampleData.transactions).forEach(tx => {
      running += tx.amount;
      const tr = document.createElement('tr');
      const statusClass = tx.status === 'Success' ? 'status-success' : (tx.status === 'Pending' ? 'status-pending' : 'status-failed');
      tr.innerHTML = `<td>${tx.date}</td><td>${tx.details}</td><td><span class="status-pill ${statusClass}">${tx.status}</span></td><td>${tx.amount < 0 ? '-' : '+'} ₹ ${Math.abs(tx.amount).toLocaleString()}</td><td class="running-balance">₹ ${numberWithCommas(Math.round(running))}</td>`;
      tbody.appendChild(tr);
    });
    $('#txCount') && ($('#txCount').textContent = (list || sampleData.transactions).length);
    const pbody = document.querySelector('#paymentsTable tbody');
    if (pbody) pbody.innerHTML = (list || sampleData.transactions).map(tx => `
      <tr>
        <td>${tx.date}</td>
        <td>${tx.details}</td>
        <td><span class="status-pill ${tx.status === 'Success' ? 'status-success' : tx.status === 'Pending' ? 'status-pending' : 'status-failed'}">${tx.status}</span></td>
        <td>₹ ${Math.abs(tx.amount).toLocaleString()}</td>
        <td>${Math.random().toString(36).slice(2, 10).toUpperCase()}</td>
      </tr>`).join('');
  }

  function initNav() {
    $all('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $all('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const section = btn.dataset.section;
        document.querySelectorAll('.content-inner').forEach(el => el.style.display = 'none');
        const target = document.getElementById(section);
        if (target) target.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    $('#quickTransferBtn') && $('#quickTransferBtn').addEventListener('click', () => {
      document.querySelectorAll('.content-inner').forEach(el => el.style.display = 'none');
      $('#transfer') && ($('#transfer').style.display = 'block');
      $all('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.nav-btn[data-section="overview"]')?.classList.add('active');
      setTimeout(() => { $('#txAmountMain')?.focus(); }, 150);
    });

    $('#openTransferTop') && $('#openTransferTop').addEventListener('click', () => {
      document.querySelectorAll('.content-inner').forEach(el => el.style.display = 'none');
      $('#transfer') && ($('#transfer').style.display = 'block');
    });
  }

  function initTransfers() {
    const form = document.getElementById('transferForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const to = $('#txTo').value.trim() || 'recipient';
        const amt = Number($('#txAmount').value) || 0;
        const from = $('#fromAccount').value;
        const msg = $('#txMsg');
        if (amt <= 0) { msg.textContent = 'Enter valid amount'; return; }
        const avail = from === 'savings' ? sampleData.balances.savings : sampleData.balances.current;
        if (amt > avail) { msg.textContent = 'Insufficient funds'; return; }
        $('#confirmTitle').textContent = `Send ₹ ${numberWithCommas(amt)} to ${to}`;
        $('#confirmBody').textContent = `From: ${from === 'savings' ? 'Savings • 4821' : 'Current • 9304'}`;
        $('#confirmModal').style.display = 'flex';
        $('#cancelConfirm').onclick = () => $('#confirmModal').style.display = 'none';
        $('#confirmTransfer').onclick = () => {
          if (from === 'savings') sampleData.balances.savings -= amt; else sampleData.balances.current -= amt;
          sampleData.transactions.unshift({ date: new Date().toISOString().slice(0, 10), details: `Transfer • ${to}`, status: 'Success', amount: -amt });
          populateBalances(); populateTxTable();
          renderRecipients();
          msg.textContent = `Sent ₹ ${numberWithCommas(amt)} to ${to}`;
          $('#confirmModal').style.display = 'none';
          setTimeout(() => msg.textContent = '', 2500);
        };
      });
    }

    const formMain = document.getElementById('transferFormMain');
    if (formMain) {
      formMain.addEventListener('submit', (e) => {
        e.preventDefault();
        const to = $('#txToMain').value.trim() || 'recipient';
        const amt = Number($('#txAmountMain').value) || 0;
        const from = $('#fromAccountMain').value;
        const msg = $('#txMsgMain');
        if (amt <= 0) { msg.textContent = 'Enter valid amount'; return; }
        const avail = from === 'savings' ? sampleData.balances.savings : sampleData.balances.current;
        if (amt > avail) { msg.textContent = 'Insufficient funds'; return; }
        if (!confirm(`Send ₹ ${numberWithCommas(amt)} to ${to}?`)) return;
        if (from === 'savings') sampleData.balances.savings -= amt; else sampleData.balances.current -= amt;
        sampleData.transactions.unshift({ date: new Date().toISOString().slice(0, 10), details: `Transfer • ${to} (UPI)`, status: 'Success', amount: -amt });
        populateBalances(); populateTxTable();
        renderRecipients();
        msg.textContent = `Sent ₹ ${numberWithCommas(amt)} to ${to}`;
        setTimeout(() => msg.textContent = '', 2400);
      });

      document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'saveRecipientBtn') {
          const val = $('#txTo').value.trim();
          if (!val) return;
          const cur = JSON.parse(localStorage.getItem('ch_recipients') || 'null') || sampleData.recipients;
          if (!cur.includes(val)) cur.unshift(val);
          localStorage.setItem('ch_recipients', JSON.stringify(cur.slice(0, 12)));
          renderRecipients();
          $('#txMsg').textContent = 'Saved';
          setTimeout(() => $('#txMsg').textContent = '', 1200);
        }
        if (e.target && e.target.id === 'saveRecipientBtnMain') {
          const val = $('#txToMain').value.trim();
          if (!val) return;
          const cur = JSON.parse(localStorage.getItem('ch_recipients') || 'null') || sampleData.recipients;
          if (!cur.includes(val)) cur.unshift(val);
          localStorage.setItem('ch_recipients', JSON.stringify(cur.slice(0, 12)));
          renderRecipients();
          $('#txMsgMain').textContent = 'Saved';
          setTimeout(() => $('#txMsgMain').textContent = '', 1200);
        }
      });
    }
  }

  function renderRecipients() {
    const list = JSON.parse(localStorage.getItem('ch_recipients') || 'null') || sampleData.recipients;
    const el = $('#recipientList');
    if (el) {
      el.innerHTML = '';
      list.slice(0, 8).forEach(r => {
        const b = document.createElement('div');
        b.className = 'recipient-chip';
        b.textContent = r;
        if (['mom@upi', 'office@upi', 'friend@upi'].includes(r)) b.classList.add('recipient-send');
        b.onclick = () => $('#txTo').value = r;
        el.appendChild(b);
      });
    }
    const el2 = $('#recipientListMain');
    if (el2) {
      el2.innerHTML = '';
      list.slice(0, 12).forEach(r => {
        const b = document.createElement('div');
        b.className = 'recipient-chip';
        b.textContent = r;
        if (['mom@upi', 'office@upi', 'friend@upi'].includes(r)) b.classList.add('recipient-send');
        b.onclick = () => $('#txToMain').value = r;
        el2.appendChild(b);
      });
    }
  }

  function initPaymentsControls() {
    const search = $('#paymentsSearch');
    const status = $('#paymentsStatus');
    const paymentsTableBody = document.querySelector('#paymentsTable tbody');

    if (search) {
      search.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        const st = status ? status.value : 'all';
        const list = sampleData.transactions.filter(t => t.details.toLowerCase().includes(q) && (st === 'all' || t.status.toLowerCase() === st));
        if (paymentsTableBody) {
          paymentsTableBody.innerHTML = list.map(tx => {
            const cls = tx.status === 'Success' ? 'status-success' : tx.status === 'Pending' ? 'status-pending' : 'status-failed';
            return `<tr><td>${tx.date}</td><td>${tx.details}</td><td><span class="status-pill ${cls}">${tx.status}</span></td><td>₹ ${Math.abs(tx.amount).toLocaleString()}</td><td>${Math.random().toString(36).slice(2, 10).toUpperCase()}</td></tr>`;
          }).join('');
        }
      });
      search.dispatchEvent(new Event('input'));
    }

    if (status) status.addEventListener('change', () => search.dispatchEvent(new Event('input')));

    const exportBtn = $('#exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const rows = sampleData.transactions.map(t => [t.date, t.details, t.status, t.amount]);
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'payments.csv'; a.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  function initAdminSection(payload) {
    const adminBtn = document.querySelector('.nav-btn[data-section="fraud"]');
    if (!adminBtn) return;
    adminBtn.addEventListener('click', async () => {
      $all('.nav-btn').forEach(b => b.classList.remove('active'));
      adminBtn.classList.add('active');
      document.querySelectorAll('.content-inner').forEach(el => el.style.display = 'none');
      const el = document.getElementById('fraud');
      if (el) el.style.display = 'block';

      // Show loading state
      el.innerHTML = '<h2>Fraud & Risk Console</h2><p class="muted-text">Loading...</p>';

      try {
        // CALL THE ACTUAL API ENDPOINT
        const response = await fetch('/api/admin', {
          method: 'GET',
          credentials: 'include', // Include cookies
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok) {
          // SUCCESS - Show the flag from backend
          el.innerHTML = `
            <h2>Fraud & Risk Console <span class="chip">admin</span></h2>
            <p class="muted-text">Welcome admin. Here is your lab flag:</p>
            <div class="flag-box">${data.flag}</div>
            <p class="muted-text">${data.message}</p>
          `;
        } else {
          // ERROR - Show hint
          el.innerHTML = `
            <h2>Fraud & Risk Console</h2>
            <p class="muted-text">${data.message}</p>
            <p class="muted-text">Hint: The API uses a JWT to decide your <code>role</code>. Try intercepting the request in Burp Suite and modifying the JWT to have alg: "none" and role: "admin".</p>
            <p class="muted-text">Current role: <strong>${payload?.role || 'unknown'}</strong></p>
          `;
        }
      } catch (error) {
        el.innerHTML = `
          <h2>Fraud & Risk Console</h2>
          <p class="muted-text">Error connecting to admin console: ${error.message}</p>
        `;
      }
    });
  }

  function initLogout() {
    $('#logoutBtn') && $('#logoutBtn').addEventListener('click', async () => {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (e) {
        // Ignore errors
      }
      window.location.href = 'index.html';
    });
  }

  function renderSpendingChart() {
    const canvas = document.getElementById('spendingChart');
    if (!canvas || typeof Chart === 'undefined') return;
    const labels = sampleData.monthlySpending.labels;
    const expenses = sampleData.monthlySpending.expenses;
    const income = sampleData.monthlySpending.income;
    try {
      new Chart(canvas, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Expenses', data: expenses, tension: 0.35, borderColor: '#f43f5e', backgroundColor: 'rgba(244,63,94,0.06)', pointRadius: 3 }, { label: 'Income', data: income, tension: 0.35, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.06)', pointRadius: 3 }] },
        options: { plugins: { legend: { position: 'bottom', labels: { color: '#cfe8ff' } } }, scales: { x: { ticks: { color: '#9ca3af' } }, y: { ticks: { color: '#9ca3af' } } } }
      });
    } catch (e) { }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    // CHECK AUTHENTICATION FIRST
    try {
      const response = await fetch('/api/me', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        // Not authenticated - redirect to login
        window.location.href = 'index.html';
        return;
      }

      const data = await response.json();
      const payload = data.user;

      showUserHeader(payload);
      populateBalances();
      populateTxTable();
      renderSpendingChart();
      renderRecipients();
      initNav();
      initTransfers();
      initPaymentsControls();
      initAdminSection(payload);
      initLogout();
    } catch (error) {
      // Network error or not authenticated
      console.error('Auth check failed:', error);
      window.location.href = 'index.html';
    }
  });
});

// Signal successful init for the HTML sanity-check
try { window.__dashboard_ready = true; } catch (e) { }
