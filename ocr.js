document.addEventListener("DOMContentLoaded", () => {

  const fileInput = document.getElementById("billImage");
  const uploadBtn = document.getElementById("uploadBtn");
  const preview = document.getElementById("preview");
  const processBtn = document.getElementById("processBtn");

  uploadBtn.onclick = () => fileInput.click();

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.hidden = false;
      processBtn.hidden = false;
    };
    reader.readAsDataURL(file);
  });

  // 🔥 AI-OCR PIPELINE
  processBtn.onclick = async () => {
    processBtn.innerText = "Analyzing with AI...";
    processBtn.disabled = true;

    try {
      const worker = await Tesseract.createWorker("eng");

      const reader = new FileReader();
      reader.onload = async () => {
        const { data } = await worker.recognize(reader.result);

        const items = extractItemsAI(data.text);

        localStorage.setItem("billData", JSON.stringify({ items }));
        await worker.terminate();

        window.location.href = "verify.html";
      };

      reader.readAsDataURL(fileInput.files[0]);

    } catch (e) {
      alert("AI OCR failed");
      processBtn.disabled = false;
    }
  };

  // 🧠 NLP + AI ENTITY EXTRACTION
function extractItemsAI(text) {
  const lines = text.split("\n");

  const items = [];
  let taxAmount = 0;

  for (let raw of lines) {
    let line = raw
      .replace(/[₹]/g, "")
      .replace(/[^A-Za-z0-9.%xX\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!line || line.length < 3) continue;

    // ❌ Ignore shop info, phone numbers, headers
    if (
      /TOTAL BILL|INVOICE|CASHIER|PHONE|MOBILE|DATE|TIME|THANK|WELCOME|STORE|SHOP/i.test(line) ||
      /\d{10}/.test(line)
    ) continue;

    // ✅ TAX DETECTION
    if (/GST|CGST|SGST|VAT|TAX/i.test(line)) {
      const nums = line.match(/\d+(\.\d+)?/g);
      if (nums) taxAmount += Number(nums[nums.length - 1]);
      continue;
    }

    const parts = line.split(" ");
    const numbers = parts.filter(p => !isNaN(p)).map(Number);
    const words = parts.filter(p => isNaN(p));

    if (numbers.length === 0 || words.length === 0) continue;

    let name = words.join(" ");
    let qty = 1, rate = 0, total = 0;

    // 🧠 Smart patterns
    if (numbers.length >= 3) {
      qty = numbers[0];
      rate = numbers[1];
      total = numbers[numbers.length - 1];
    } else if (numbers.length === 2) {
      rate = numbers[0];
      total = numbers[1];
    } else {
      total = numbers[0];
      rate = total;
    }

    if (total <= 0) continue;

    items.push({
      name,
      qty,
      rate,
      total,
      confidence: "high"
    });
  }

  // 🔥 Save TAX separately
  localStorage.setItem("billTax", taxAmount.toFixed(2));

  return items;
}


});
