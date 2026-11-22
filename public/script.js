const form = document.querySelector("#invoiceForm");
const itemsContainer = document.querySelector("#itemsContainer");
const addItemBtn = document.querySelector("#addItem");
const currencySelect = document.querySelector("#currencySelect");
const mobileCurrencySelect = document.querySelector("#mobileCurrencySelect");

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
let activeRate = 1; // Base rate in USD

// ======================================================
// NUMBER / COMMA FORMATTING HELPERS
// ======================================================

function parseNumericValue(val) {
    if (val === null || val === undefined || val === "") return 0;
    const cleaned = String(val).replace(/,/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

function formatInputWithCommas(rawValue) {
    let cleaned = String(rawValue).replace(/[^0-9.]/g, "");
    if (!cleaned) return "";

    const parts = cleaned.split(".");
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? "." + parts.slice(1).join("") : "";

    const formattedInt = integerPart ? Number(integerPart).toLocaleString("en-US") : "0";
    return formattedInt + decimalPart;
}

// ======================================================
// SECRET CODE ACCESS GATE (TWO-STEP AUTOMATIC DETECTION)
// ======================================================

let currentSecretCode = "";
let pendingNewCode = null; // Holds new PIN awaiting confirmation

const accessGateOverlay = document.querySelector("#accessGateOverlay");
const accessGateCard = document.querySelector(".access-gate-card");
const accessGateForm = document.querySelector("#accessGateForm");
const secretCodeInput = document.querySelector("#secretCodeInput");
const confirmCodeInput = document.querySelector("#confirmCodeInput");
const gateTitle = document.querySelector("#gateTitle");
const gateSubtitle = document.querySelector("#gateSubtitle");
const gateSubmitBtn = document.querySelector("#gateSubmitBtn");
const gateErrorMsg = document.querySelector("#gateErrorMsg");
const skipGateBtn = document.querySelector("#skipGateBtn");
const backToPinBtn = document.querySelector("#backToPinBtn");

function triggerShakeError(message) {
    gateErrorMsg.textContent = message;
    gateErrorMsg.style.display = "block";
    accessGateCard.classList.remove("shake-card");
    void accessGateCard.offsetWidth;
    accessGateCard.classList.add("shake-card");
}

function resetGateToStepOne() {
    pendingNewCode = null;
    gateTitle.textContent = "Enter Secret PIN";
    gateSubtitle.textContent = "Input your personal secret code (min 4 characters) to open your workspace or create a new one.";
    secretCodeInput.value = "";
    secretCodeInput.disabled = false;
    confirmCodeInput.value = "";
    confirmCodeInput.style.display = "none";
    confirmCodeInput.required = false;
    gateSubmitBtn.textContent = "Continue";
    backToPinBtn.style.display = "none";
    gateErrorMsg.style.display = "none";
    secretCodeInput.focus();
}

backToPinBtn.addEventListener("click", resetGateToStepOne);

skipGateBtn.addEventListener("click", () => {
    const msg = pendingNewCode
        ? "Access Required: Please confirm your new PIN to create your workspace."
        : "Access Required: You cannot skip this step. Please enter or create a secret PIN (min 4 characters) to continue.";
    triggerShakeError(msg);
    (pendingNewCode ? confirmCodeInput : secretCodeInput).focus();
});

accessGateForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // STEP 2: Confirming a brand-new PIN
    if (pendingNewCode) {
        const confirmedVal = confirmCodeInput.value.trim().toLowerCase();
        if (confirmedVal !== pendingNewCode) {
            triggerShakeError("PINs do not match. Re-enter the exact same secret PIN to confirm.");
            confirmCodeInput.focus();
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: pendingNewCode })
            });
            const data = await res.json();

            if (!res.ok) {
                triggerShakeError(data.error || "Could not create PIN.");
                return;
            }

            currentSecretCode = data.code;
            gateErrorMsg.style.display = "none";
            accessGateOverlay.style.display = "none";
        } catch (err) {
            triggerShakeError("Unable to connect to server. Please try again.");
        }
        return;
    }

    // STEP 1: Check whether entered code belongs to an old user or a new user
    const enteredCode = secretCodeInput.value.trim();
    if (enteredCode.length < 4) {
        triggerShakeError("Your secret PIN must be at least 4 characters long.");
        return;
    }

    try {
        const res = await fetch("/api/auth/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: enteredCode })
        });
        const data = await res.json();

        if (!res.ok) {
            triggerShakeError(data.error || "Invalid secret PIN.");
            return;
        }

        // Old user -> unlock immediately
        if (data.status === "existing") {
            currentSecretCode = data.code;
            gateErrorMsg.style.display = "none";
            accessGateOverlay.style.display = "none";
            return;
        }

        // New user -> prompt to confirm creating a new PIN
        pendingNewCode = data.code;
        gateTitle.textContent = "Create New Secret PIN";
        gateSubtitle.textContent = "This code is not registered yet. Re-enter it below to confirm and create your new workspace.";
        secretCodeInput.disabled = true;
        confirmCodeInput.style.display = "block";
        confirmCodeInput.required = true;
        gateSubmitBtn.textContent = "Create PIN & Unlock";
        backToPinBtn.style.display = "inline-block";
        gateErrorMsg.style.display = "none";
        confirmCodeInput.focus();
    } catch (err) {
        triggerShakeError("Unable to connect to server. Please try again.");
    }
});

// ======================================================
// CUSTOM LOGO UPLOAD (CLEARS ON PAGE REFRESH)
// ======================================================

const logoInput = document.querySelector("#logoInput");
const defaultLogoIcon = document.querySelector("#defaultLogoIcon");
const uploadedLogoImg = document.querySelector("#uploadedLogoImg");
const previewLogoImg = document.querySelector("#previewLogoImg");

logoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64Logo = event.target.result;
        defaultLogoIcon.style.display = "none";
        uploadedLogoImg.src = base64Logo;
        uploadedLogoImg.style.display = "block";
        previewLogoImg.src = base64Logo;
        previewLogoImg.style.display = "block";
    };
    reader.readAsDataURL(file);
});

// ======================================================
// WORLD CURRENCIES LIST (WITH EXCHANGE RATES RELATIVE TO USD)
// ======================================================

const worldCurrencies = [
    { code: "USD", symbol: "$", name: "USD ($)", rate: 1 },
    { code: "NGN", symbol: "₦", name: "NGN (₦)", rate: 1600 },
    { code: "EUR", symbol: "€", name: "EUR (€)", rate: 0.92 },
    { code: "GBP", symbol: "£", name: "GBP (£)", rate: 0.79 },
    { code: "CAD", symbol: "CA$", name: "CAD (CA$)", rate: 1.38 },
    { code: "AUD", symbol: "A$", name: "AUD (A$)", rate: 1.52 },
    { code: "JPY", symbol: "¥", name: "JPY (¥)", rate: 154 },
    { code: "INR", symbol: "₹", name: "INR (₹)", rate: 84 },
    { code: "CNY", symbol: "¥", name: "CNY (¥)", rate: 7.24 },
    { code: "ZAR", symbol: "R", name: "ZAR (R)", rate: 18.1 },
    { code: "GHS", symbol: "GH₵", name: "GHS (GH₵)", rate: 16.2 },
    { code: "KES", symbol: "KSh", name: "KES (KSh)", rate: 129 },
    { code: "AED", symbol: "AED", name: "AED", rate: 3.67 },
    { code: "SAR", symbol: "SR", name: "SAR (SR)", rate: 3.75 }
];

function populateCurrencies() {
    [currencySelect, mobileCurrencySelect].forEach(selectEl => {
        if (!selectEl) return;
        selectEl.innerHTML = "";
        worldCurrencies.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.code;
            opt.setAttribute("data-symbol", c.symbol);
            opt.setAttribute("data-rate", c.rate);
            opt.textContent = c.name;
            selectEl.appendChild(opt);
        });
    });
}

populateCurrencies();

// Set Today's Date by default
document.querySelector("#invoiceDate").valueAsDate = new Date();

// ======================================================
// CURRENCY CHANGE & AUTOMATIC PRICE CONVERSION
// ======================================================

function setCurrencyByCode(newCode, convertAmounts = true) {
    const currencyObj = worldCurrencies.find(c => c.code === newCode) || worldCurrencies[0];
    const newSymbol = currencyObj.symbol;
    const newRate = currencyObj.rate;

    if (currencySelect) currencySelect.value = newCode;
    if (mobileCurrencySelect) mobileCurrencySelect.value = newCode;

    if (convertAmounts) {
        document.querySelectorAll(".item-price").forEach(input => {
            const currentVal = parseNumericValue(input.value);
            if (currentVal > 0) {
                const amountInUSD = currentVal / activeRate;
                const convertedAmount = Number((amountInUSD * newRate).toFixed(2));
                input.value = formatInputWithCommas(convertedAmount);
            }
        });
    }

    activeSymbol = newSymbol;
    activeRate = newRate;

    document.querySelectorAll(".curr-symbol").forEach(el => {
        el.textContent = activeSymbol;
    });

    calculateTotals();
}

function handleCurrencyChange(e) {
    setCurrencyByCode(e.target.value, true);
}

currencySelect.addEventListener("change", handleCurrencyChange);
if (mobileCurrencySelect) {
    mobileCurrencySelect.addEventListener("change", handleCurrencyChange);
}

function formatMoney(amount) {
    return `${activeSymbol}${Number(amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

// ======================================================
// DYNAMIC ITEM ROWS WITH LIVE COMMA FORMATTING
// ======================================================

function createItemRow(name = "", qty = 1, price = "") {
    const row = document.createElement("div");
    row.className = "item-row";
    const numericPrice = parseNumericValue(price);
    const formattedInitialPrice = price !== "" ? formatInputWithCommas(price) : "";

    row.innerHTML = `
        <div>
            <input type="text" class="item-name light-input" placeholder="Item name / Description" value="${name}" style="margin:0;">
        </div>
        <div class="qty-input-box">
            <input type="number" class="item-qty" min="1" value="${qty}">
        </div>
        <div class="rate-input-box">
            <span class="curr-symbol">${activeSymbol}</span>
            <input type="text" inputmode="decimal" class="item-price" placeholder="0.00" value="${formattedInitialPrice}">
        </div>
        <div class="total-val-box item-total">${formatMoney(qty * numericPrice)}</div>
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

// Format price input with commas live while typing
itemsContainer.addEventListener("input", (e) => {
    if (e.target.classList.contains("item-price")) {
        e.target.value = formatInputWithCommas(e.target.value);
    }
    calculateTotals();
});

form.addEventListener("input", calculateTotals);

// ======================================================
// CALCULATE TOTALS
// ======================================================

function calculateTotals() {
    let subtotal = 0;
    const rows = document.querySelectorAll(".item-row");

    rows.forEach(row => {
        const qty = Number(row.querySelector(".item-qty").value) || 0;
        const price = parseNumericValue(row.querySelector(".item-price").value);
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
// PREVIEW & SERVER-SIDE SAVE LOGIC
// ======================================================

function renderInvoicePreview() {
    const customerName = document.querySelector("#customerName").value.trim();
    if (!customerName) {
        alert("Please enter the client's name.");
        return false;
    }

    document.querySelector("#previewCustomerName").textContent = customerName;
    document.querySelector("#previewCustomerEmail").textContent = document.querySelector("#customerEmail").value;
    document.querySelector("#previewInvoiceNumber").textContent = document.querySelector("#invoiceNumber").value;
    document.querySelector("#previewInvoiceDate").textContent = document.querySelector("#invoiceDate").value;
    document.querySelector("#previewDueDate").textContent = document.querySelector("#dueDate").value || "N/A";

    const previewItems = document.querySelector("#previewItems");
    previewItems.innerHTML = "";
    document.querySelectorAll(".item-row").forEach(row => {
        const name = row.querySelector(".item-name").value || "Item / Service";
        const qty = Number(row.querySelector(".item-qty").value) || 0;
        const price = parseNumericValue(row.querySelector(".item-price").value);
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

    document.querySelector("#previewSubtotal").textContent = document.querySelector("#subtotal").textContent;
    document.querySelector("#previewGrandTotal").textContent = document.querySelector("#grandTotal").textContent;

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

    const previewLateFeesSection = document.querySelector("#previewLateFeesSection");
    if (toggleLateFees.checked) {
        previewLateFeesSection.style.display = "block";
        document.querySelector("#previewLateFees").textContent = document.querySelector("#lateFeesPolicy").value || "Late fees apply if paid after due date.";
    } else {
        previewLateFeesSection.style.display = "none";
    }

    const previewNotesSection = document.querySelector("#previewNotesSection");
    if (toggleNotes.checked) {
        previewNotesSection.style.display = "block";
        document.querySelector("#previewInvoiceNotes").textContent = document.querySelector("#invoiceNotes").value || "Thanks for your business!";
    } else {
        previewNotesSection.style.display = "none";
    }

    const preview = document.querySelector("#invoicePreview");
    preview.style.display = "block";

    saveInvoiceToServer();

    return true;
}

async function saveInvoiceToServer() {
    if (!currentSecretCode) return;

    const customerName = document.querySelector("#customerName").value.trim() || "Client";
    const itemsList = Array.from(document.querySelectorAll(".item-row")).map(row => ({
        name: row.querySelector(".item-name").value || "",
        qty: row.querySelector(".item-qty").value,
        price: parseNumericValue(row.querySelector(".item-price").value)
    }));

    const invoiceRecord = {
        invoiceNumber: document.querySelector("#invoiceNumber").value,
        businessName: document.querySelector("#businessName").value,
        businessEmail: document.querySelector("#businessEmail").value,
        clientName: customerName,
        clientEmail: document.querySelector("#customerEmail").value,
        date: document.querySelector("#invoiceDate").value,
        dueDate: document.querySelector("#dueDate").value,
        currencyCode: currencySelect.value,
        items: itemsList,
        total: document.querySelector("#grandTotal").textContent,
        paymentEnabled: togglePayment.checked,
        depositPercent: document.querySelector("#depositPercent").value,
        bankName: document.querySelector("#bankName").value,
        accountNumber: document.querySelector("#accountNumber").value,
        accountName: document.querySelector("#accountName").value,
        notes: document.querySelector("#invoiceNotes").value,
        savedAt: new Date().toISOString()
    };

    await fetch("/api/invoices", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-access-code": currentSecretCode
        },
        body: JSON.stringify(invoiceRecord)
    });
}

// ======================================================
// INVOICE HISTORY MODAL (VIEW, LOAD, DELETE FROM SERVER)
// ======================================================

const historyModal = document.querySelector("#historyModal");
const openHistoryBtn = document.querySelector("#openHistoryBtn");
const closeHistoryBtn = document.querySelector("#closeHistoryBtn");
const historyListContainer = document.querySelector("#historyListContainer");

async function renderHistoryList() {
    const res = await fetch("/api/invoices", {
        headers: { "x-access-code": currentSecretCode }
    });
    const history = await res.json();

    if (history.length === 0) {
        historyListContainer.innerHTML = `<p style="color:#64748b; font-size:13px; text-align:center; padding:20px 0;">No saved invoices found for this PIN yet. Click Preview, Send, or Download to save an invoice.</p>`;
        return;
    }

    historyListContainer.innerHTML = "";
    history.forEach((inv, index) => {
        const card = document.createElement("div");
        card.className = "history-card-item";
        card.innerHTML = `
            <div class="history-card-info">
                <h4>${inv.invoiceNumber} — ${inv.clientName}</h4>
                <p>${inv.date || "No date"} • <strong>${inv.total}</strong></p>
            </div>
            <div class="history-card-actions">
                <button type="button" class="btn-hist-load" data-index="${index}">Load</button>
                <button type="button" class="btn-hist-del" data-num="${encodeURIComponent(inv.invoiceNumber)}">Delete</button>
            </div>
        `;
        historyListContainer.appendChild(card);
    });
}

openHistoryBtn.addEventListener("click", () => {
    renderHistoryList();
    historyModal.style.display = "flex";
});

closeHistoryBtn.addEventListener("click", () => {
    historyModal.style.display = "none";
});

historyModal.addEventListener("click", (e) => {
    if (e.target === historyModal) historyModal.style.display = "none";
});

historyListContainer.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-hist-load")) {
        const res = await fetch("/api/invoices", {
            headers: { "x-access-code": currentSecretCode }
        });
        const history = await res.json();
        const idx = Number(e.target.getAttribute("data-index"));
        const inv = history[idx];
        if (!inv) return;

        document.querySelector("#invoiceNumber").value = inv.invoiceNumber || "";
        document.querySelector("#businessName").value = inv.businessName || "";
        document.querySelector("#businessEmail").value = inv.businessEmail || "";
        document.querySelector("#customerName").value = inv.clientName || "";
        document.querySelector("#customerEmail").value = inv.clientEmail || "";
        document.querySelector("#invoiceDate").value = inv.date || "";
        document.querySelector("#dueDate").value = inv.dueDate || "";
        document.querySelector("#invoiceNotes").value = inv.notes || "";

        if (inv.currencyCode) {
            setCurrencyByCode(inv.currencyCode, false);
        }

        itemsContainer.innerHTML = "";
        if (inv.items && inv.items.length > 0) {
            inv.items.forEach(item => createItemRow(item.name, item.qty, item.price));
        } else {
            createItemRow();
        }

        if (inv.paymentEnabled) {
            togglePayment.checked = true;
            paymentMethodBlock.style.display = "block";
            document.querySelector("#depositPercent").value = inv.depositPercent || 50;
            document.querySelector("#bankName").value = inv.bankName || "";
            document.querySelector("#accountNumber").value = inv.accountNumber || "";
            document.querySelector("#accountName").value = inv.accountName || "";
        }

        calculateTotals();
        historyModal.style.display = "none";
        renderInvoicePreview();
    }

    if (e.target.classList.contains("btn-hist-del")) {
        const encodedNum = e.target.getAttribute("data-num");
        await fetch(`/api/invoices/${encodedNum}`, {
            method: "DELETE",
            headers: { "x-access-code": currentSecretCode }
        });
        renderHistoryList();
    }
});

// ======================================================
// EXPORT & PRINT ACTIONS
// ======================================================

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