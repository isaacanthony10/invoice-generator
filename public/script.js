const form = document.querySelector("#invoiceForm");
const itemsContainer = document.querySelector("#itemsContainer");
const addItemBtn = document.querySelector("#addItem");
const currencySelect = document.querySelector("#currencySelect");

// TOGGLES
const togglePayment = document.querySelector("#togglePayment");
const toggleLateFees = document.querySelector("#toggleLateFees");
const toggleNotes = document.querySelector("#toggleNotes");

const paymentMethodBlock = document.querySelector("#paymentMethodBlock");
const lateFeesBlock = document.querySelector("#lateFeesBlock");
const notesBlock = document.querySelector("#notesBlock");

const toggleTaxBtn = document.querySelector("#toggleTaxBtn");
const taxRow = document.querySelector("#taxRow");
const toggleDiscountBtn = document.querySelector("#toggleDiscountBtn");
const discountRow = document.querySelector("#discountRow");

let activeSymbol = "$";

// ======================================================
// WORLD CURRENCIES LIST
// ======================================================

const worldCurrencies = [
    { code: "USD", symbol: "$", name: "USD ($)" },
    { code: "NGN", symbol: "₦", name: "NGN (₦)" },
    { code: "EUR", symbol: "€", name: "EUR (€)" },
    { code: "GBP", symbol: "£", name: "GBP (£)" },
    { code: "CAD", symbol: "CA$", name: "CAD (CA$)" },
    { code: "AUD", symbol: "A$", name: "AUD (A$)" },
    { code: "JPY", symbol: "¥", name: "JPY (¥)" },
    { code: "INR", symbol: "₹", name: "INR (₹)" },
    { code: "CNY", symbol: "¥", name: "CNY (¥)" },
    { code: "ZAR", symbol: "R", name: "ZAR (R)" },
    { code: "GHS", symbol: "GH₵", name: "GHS (GH₵)" },
    { code: "KES", symbol: "KSh", name: "KES (KSh)" },
    { code: "AED", symbol: "AED", name: "AED" },
    { code: "SAR", symbol: "SR", name: "SAR (SR)" }
];

function populateCurrencies() {
    currencySelect.innerHTML = "";
    worldCurrencies.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.code;
        opt.setAttribute("data-symbol", c.symbol);
        opt.textContent = c.name;
        currencySelect.appendChild(opt);
    });
}

populateCurrencies();

// Set Today's Date by default
document.querySelector("#invoiceDate").valueAsDate = new Date();

// ======================================================
// CURRENCY CHANGE EVENT
// ======================================================

currencySelect.addEventListener("change", (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    activeSymbol = selectedOption.getAttribute("data-symbol");
    
    document.querySelectorAll(".curr-symbol").forEach(el => {
        el.textContent = activeSymbol;
    });

    calculateTotals();
});

function formatMoney(amount) {
    return `${activeSymbol}${Number(amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

// ======================================================
// DYNAMIC ITEM ROWS
// ======================================================

function createItemRow(name = "", qty = 1, price = 0) {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
        <div>
            <input type="text" class="item-name light-input" placeholder="Item name / Description" value="${name}" style="margin:0;">
        </div>
        <div class="qty-input-box">
            <input type="number" class="item-qty" min="1" value="${qty}">
        </div>
        <div class="rate-input-box">
            <span class="curr-symbol">${activeSymbol}</span>
            <input type="number" class="item-price" min="0" step="0.01" placeholder="0.00" value="${price}">
        </div>
        <div class="total-val-box item-total">${formatMoney(qty * price)}</div>
        <div style="text-align: center;">
            <button type="button" class="btn-remove-dots remove-item">&times;</button>
        </div>
    `;
    itemsContainer.appendChild(row);
    calculateTotals();
}

addItemBtn.addEventListener("click", () => createItemRow());

itemsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-item")) {
        e.target.closest(".item-row").remove();
        calculateTotals();
    }
});

itemsContainer.addEventListener("input", calculateTotals);
form.addEventListener("input", calculateTotals);

// ======================================================
// CALCULATE TOTALS
// ======================================================

function calculateTotals() {
    let subtotal = 0;
    const rows = document.querySelectorAll(".item-row");

    rows.forEach(row => {
        const qty = Number(row.querySelector(".item-qty").value) || 0;
        const price = Number(row.querySelector(".item-price").value) || 0;
        const total = qty * price;
        subtotal += total;
        row.querySelector(".item-total").textContent = formatMoney(total);
    });

    const discountRate = (discountRow.style.display !== "none") ? (Number(document.querySelector("#discountRate").value) || 0) : 0;
    const discountAmount = subtotal * (discountRate / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;

    const taxRate = (taxRow.style.display !== "none") ? (Number(document.querySelector("#taxRate").value) || 0) : 0;
    const taxAmount = subtotalAfterDiscount * (taxRate / 100);

    const grandTotal = subtotalAfterDiscount + taxAmount;

    document.querySelector("#subtotal").textContent = formatMoney(subtotal);
    document.querySelector("#grandTotal").textContent = formatMoney(grandTotal);
}

// ======================================================
// SIDEBAR SWITCH TOGGLES & LINK BUTTONS
// ======================================================

togglePayment.addEventListener("change", () => {
    paymentMethodBlock.style.display = togglePayment.checked ? "block" : "none";
});

toggleLateFees.addEventListener("change", () => {
    lateFeesBlock.style.display = toggleLateFees.checked ? "block" : "none";
});

toggleNotes.addEventListener("change", () => {
    notesBlock.style.display = toggleNotes.checked ? "block" : "none";
});

toggleTaxBtn.addEventListener("click", () => {
    taxRow.style.display = taxRow.style.display === "none" ? "flex" : "none";
    calculateTotals();
});

toggleDiscountBtn.addEventListener("click", () => {
    discountRow.style.display = discountRow.style.display === "none" ? "flex" : "none";
    calculateTotals();
});

createItemRow();

// ======================================================
// PREVIEW & SAVE LOGIC
// ======================================================

function renderInvoicePreview() {
    const customerName = document.querySelector("#customerName").value.trim();
    if (!customerName) {
        alert("Please enter the client's name.");
        return false;
    }

    // Fill preview values
    document.querySelector("#previewCustomerName").textContent = customerName;
    document.querySelector("#previewCustomerEmail").textContent = document.querySelector("#customerEmail").value;
    document.querySelector("#previewInvoiceNumber").textContent = document.querySelector("#invoiceNumber").value;
    document.querySelector("#previewInvoiceDate").textContent = document.querySelector("#invoiceDate").value;
    document.querySelector("#previewDueDate").textContent = document.querySelector("#dueDate").value || "N/A";

    // Items preview
    const previewItems = document.querySelector("#previewItems");
    previewItems.innerHTML = "";
    document.querySelectorAll(".item-row").forEach(row => {
        const name = row.querySelector(".item-name").value || "Item / Service";
        const qty = Number(row.querySelector(".item-qty").value) || 0;
        const price = Number(row.querySelector(".item-price").value) || 0;
        const total = qty * price;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${name}</strong></td>
            <td class="text-right">${qty}</td>
            <td class="text-right">${formatMoney(price)}</td>
            <td class="text-right">${formatMoney(total)}</td>
        `;
        previewItems.appendChild(tr);
    });

    // Totals
    document.querySelector("#previewSubtotal").textContent = document.querySelector("#subtotal").textContent;
    document.querySelector("#previewGrandTotal").textContent = document.querySelector("#grandTotal").textContent;

    // PAYMENT TERMS & DEPOSIT CALCULATION
    const previewPaymentSection = document.querySelector("#previewPaymentSection");
    if (togglePayment.checked) {
        previewPaymentSection.style.display = "block";
        
        const grandTotalText = document.querySelector("#grandTotal").textContent;
        const numericTotal = parseFloat(grandTotalText.replace(/[^0-9.-]+/g, "")) || 0;
        const depositPct = Number(document.querySelector("#depositPercent").value) || 50;
        
        const depositVal = numericTotal * (depositPct / 100);
        const remainingVal = numericTotal - depositVal;

        document.querySelector("#previewDepositHeading").textContent = 
            `${depositPct}% Initial Payment Required: ${formatMoney(depositVal)}`;
        
        document.querySelector("#previewDepositSubtext").textContent = 
            `The remaining ${100 - depositPct}% balance of ${formatMoney(remainingVal)} is payable upon completion of the agreed project/service.`;

        document.querySelector("#previewAccountNumber").textContent = document.querySelector("#accountNumber").value || "---";
        document.querySelector("#previewBankName").textContent = document.querySelector("#bankName").value || "---";
        document.querySelector("#previewAccountName").textContent = document.querySelector("#accountName").value || "---";
    } else {
        previewPaymentSection.style.display = "none";
    }

    // Late Fees Section
    const previewLateFeesSection = document.querySelector("#previewLateFeesSection");
    if (toggleLateFees.checked) {
        previewLateFeesSection.style.display = "block";
        document.querySelector("#previewLateFees").textContent = document.querySelector("#lateFeesPolicy").value || "Late fees apply if paid after due date.";
    } else {
        previewLateFeesSection.style.display = "none";
    }

    // Notes Section
    const previewNotesSection = document.querySelector("#previewNotesSection");
    if (toggleNotes.checked) {
        previewNotesSection.style.display = "block";
        document.querySelector("#previewInvoiceNotes").textContent = document.querySelector("#invoiceNotes").value || "Thanks for your business!";
    } else {
        previewNotesSection.style.display = "none";
    }

    const preview = document.querySelector("#invoicePreview");
    preview.style.display = "block";

    saveInvoiceToStorage();

    return true;
}

function saveInvoiceToStorage() {
    const customerName = document.querySelector("#customerName").value.trim() || "Client";
    const itemsList = Array.from(document.querySelectorAll(".item-row")).map(row => ({
        name: row.querySelector(".item-name").value || "Item",
        qty: row.querySelector(".item-qty").value,
        price: row.querySelector(".item-price").value
    }));

    const invoiceRecord = {
        invoiceNumber: document.querySelector("#invoiceNumber").value,
        clientName: customerName,
        clientEmail: document.querySelector("#customerEmail").value,
        date: document.querySelector("#invoiceDate").value,
        dueDate: document.querySelector("#dueDate").value,
        items: itemsList,
        total: document.querySelector("#grandTotal").textContent,
        savedAt: new Date().toISOString()
    };

    const history = JSON.parse(localStorage.getItem("invoices")) || [];
    
    const existingIndex = history.findIndex(i => i.invoiceNumber === invoiceRecord.invoiceNumber);
    if (existingIndex > -1) {
        history[existingIndex] = invoiceRecord;
    } else {
        history.push(invoiceRecord);
    }

    localStorage.setItem("invoices", JSON.stringify(history));
}

function getExportFilename() {
    const rawClient = document.querySelector("#customerName").value.trim() || "Client";
    const clientSanitized = rawClient.replace(/[^a-zA-Z0-9]/g, "_");
    
    const firstItem = document.querySelectorAll(".item-name")[0]?.value.trim() || "Invoice";
    const itemSanitized = firstItem.replace(/[^a-zA-Z0-9]/g, "_");

    return `Invoice_${clientSanitized}_${itemSanitized}`;
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (renderInvoicePreview()) {
        document.querySelector("#invoicePreview").scrollIntoView({ behavior: "smooth" });
    }
});

// ======================================================
// SEND INVOICE & DOWNLOAD ACTIONS
// ======================================================

document.querySelector("#sendInvoiceBtn").addEventListener("click", () => {
    if (renderInvoicePreview()) {
        window.print();
    }
});

document.querySelector("#downloadPDF").addEventListener("click", async () => {
    const preview = document.querySelector("#invoicePreview");
    if (preview.style.display === "none") {
        if (!renderInvoicePreview()) return;
    }

    try {
        const sheet = document.querySelector(".document-sheet");
        const canvas = await html2canvas(sheet, { scale: 2, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jspdf.jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${getExportFilename()}.pdf`);
    } catch (err) {
        console.error(err);
        alert("Error generating PDF.");
    }
});