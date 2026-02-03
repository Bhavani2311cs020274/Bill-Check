const data = JSON.parse(localStorage.getItem("billData")) || { items: [] };
const list = document.getElementById("itemList");

let states = data.items.map(() => false);

function render() {
  list.innerHTML = "";

  if (!data.items.length) {
    list.innerHTML = "<p>No items detected</p>";
    return;
  }

  data.items.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = `item-card ${states[i] ? "received" : "missing"}`;
    card.style.cursor = "pointer";

    card.innerHTML = `
      <div class="checkbox-container">
        <input type="checkbox" ${states[i] ? "checked" : ""}>
      </div>

      <div class="item-details">
        <strong>${item.name}</strong>
        <p class="muted">Qty: ${item.qty} × ₹${item.rate}</p>
        <small style="color:${item.confidence === "high" ? "var(--success)" : "var(--warning)"}">
          ${item.confidence === "high" ? "✔ AI confident" : "⚠ Needs review"}
        </small>
      </div>

      <div class="item-price">
        <strong>₹ ${item.total.toFixed(2)}</strong>
      </div>
    `;

    // 🔥 Click anywhere on card toggles checkbox
    card.onclick = () => {
      states[i] = !states[i];
      render();
    };

    // Prevent double toggle when clicking checkbox directly
    card.querySelector("input").onclick = e => {
      e.stopPropagation();
      states[i] = e.target.checked;
      render();
    };

    list.appendChild(card);
  });

  updateStats();
  updateProgress();
}

function updateStats() {
  const totalItems = data.items.length;
  const received = states.filter(s => s).length;

  document.getElementById("totalCount").innerText = totalItems;
  document.getElementById("receivedCount").innerText = received;
  document.getElementById("missingCount").innerText = totalItems - received;

  const totalAmount = data.items.reduce((s, i) => s + i.total, 0);
  const verifiedAmount = data.items.reduce(
    (s, i, idx) => s + (states[idx] ? i.total : 0),
    0
  );

  document.getElementById("verifiedAmt").innerText = `₹ ${verifiedAmount.toFixed(2)}`;
  document.getElementById("totalBillAmt").innerText = `₹ ${totalAmount.toFixed(2)}`;
}

function updateProgress() {
  const totalItems = data.items.length;
  const verifiedItems = states.filter(s => s).length;

  const percent = totalItems
    ? (verifiedItems / totalItems) * 100
    : 0;

  const bar = document.getElementById("footerProgress");
  bar.style.width = percent.toFixed(1) + "%";
}


function toggleAll(v) {
  states = states.map(() => v);
  render();
}

function goToSummary() {
  const received = [];
  const missing = [];

  data.items.forEach((item, i) =>
    states[i] ? received.push(item) : missing.push(item)
  );

  localStorage.setItem("receivedList", JSON.stringify(received));
  localStorage.setItem("missingList", JSON.stringify(missing));
  window.location.href = "summary.html";
}

render();
