const received = JSON.parse(localStorage.getItem("receivedList")) || [];
const missing = JSON.parse(localStorage.getItem("missingList")) || [];

const recTotal = received.reduce((s, i) => s + i.total, 0);
const misTotal = missing.reduce((s, i) => s + i.total, 0);
const rate = Math.round((received.length / (received.length + missing.length)) * 100);

document.getElementById("sumTitle").innerText = `${missing.length} Item${missing.length === 1 ? '' : 's'} Missing`;
document.getElementById("sumRecCount").innerText = received.length;
document.getElementById("sumRecVal").innerText = `₹ ${recTotal.toFixed(2)}`;
document.getElementById("sumMisCount").innerText = missing.length;
document.getElementById("sumMisVal").innerText = `₹ ${misTotal.toFixed(2)}`;
document.getElementById("ratePerc").innerText = rate + "%";
document.getElementById("rateFill").style.width = rate + "%";

const list = document.getElementById("finalMissingList");
list.innerHTML = missing.map(i => `
  <div class="item-card" style="margin-bottom: 0.5rem; border: none;">
    <div class="item-info">
      <strong>${i.name}</strong><br><small>Qty: ${i.qty}</small>
    </div>
    <div style="color: var(--danger)">₹ ${i.total.toFixed(2)}</div>
  </div>
`).join("") || "<p>All items received!</p>";