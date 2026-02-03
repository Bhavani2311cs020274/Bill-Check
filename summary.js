const received = JSON.parse(localStorage.getItem("receivedList")) || [];
const missing = JSON.parse(localStorage.getItem("missingList")) || [];
const tax = Number(localStorage.getItem("billTax")) || 0;

// Totals
const recTotal = received.reduce((s, i) => s + i.total, 0);
const misTotal = missing.reduce((s, i) => s + i.total, 0);
const grandTotal = recTotal + misTotal + tax;

// Verification rate (ITEM COUNT BASED)
const totalItems = received.length + missing.length;
const rate = totalItems ? Math.round((received.length / totalItems) * 100) : 0;

// Header
document.getElementById("sumTitle").innerText =
  `${missing.length} Item${missing.length === 1 ? "" : "s"} Missing`;

// Received
document.getElementById("sumRecCount").innerText = received.length;
document.getElementById("sumRecVal").innerText = `₹ ${recTotal.toFixed(2)}`;

// Missing
document.getElementById("sumMisCount").innerText = missing.length;
document.getElementById("sumMisVal").innerText = `₹ ${misTotal.toFixed(2)}`;

// Tax & Grand Total
document.getElementById("taxVal").innerText = `₹ ${tax.toFixed(2)}`;
document.getElementById("grandTotal").innerText = `₹ ${grandTotal.toFixed(2)}`;

// Verification rate UI
document.getElementById("ratePerc").innerText = rate + "%";
document.getElementById("rateFill").style.width = rate + "%";

// Missing items list
const list = document.getElementById("finalMissingList");

if (missing.length === 0) {
  list.innerHTML = "<p style='color:var(--success)'>🎉 All items received!</p>";
} else {
  list.innerHTML = missing.map(i => `
    <div class="item-card" style="margin-bottom:0.5rem; border:none;">
      <div class="item-info">
        <strong>${i.name}</strong><br>
        <small>Qty: ${i.qty}</small>
      </div>
      <div style="color:var(--danger)">
        ₹ ${i.total.toFixed(2)}
      </div>
    </div>
  `).join("");
}
