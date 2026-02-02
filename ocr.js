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

    for (let raw of lines) {
      let line = raw
        .replace(/[₹]/g, "")
        .replace(/[^A-Za-z0-9.xX\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      if (
        line.length < 3 ||
        /TOTAL|GST|TAX|AMOUNT|DATE|THANK|BILL|INVOICE/i.test(line)
      ) continue;

      const tokens = line.split(" ");
      const numbers = tokens.filter(t => !isNaN(t)).map(Number);
      const words = tokens.filter(t => isNaN(t));

      if (!words.length || !numbers.length) continue;

      let name = words.join(" ");
      let qty = 1, rate = 0, total = 0;

      // 🧠 AI Heuristics
      if (numbers.length === 3) {
        qty = numbers[0];
        rate = numbers[1];
        total = numbers[2];
      } else if (numbers.length === 2) {
        rate = numbers[0];
        total = numbers[1];
      } else if (numbers.length === 1) {
        rate = numbers[0];
        total = rate;
      }

      const confidence =
        name.length > 3 && total > 0 ? "high" : "low";

      items.push({
        name,
        qty,
        rate,
        total,
        confidence
      });
    }

    return items;
  }

});
