const form = document.querySelector("#invoiceForm");
const itemsContainer = document.querySelector("#itemsContainer");
const addItemBtn = document.querySelector("#addItem");
const currencySelect = document.querySelector("#currencySelect");
const clientPresetSelect = document.querySelector("#clientPresetSelect");
const saveClientPresetBtn = document.querySelector("#saveClientPresetBtn");

let activeCurrency = { code: "NGN", symbol: "₦" };

// ======================================================
// INITIALIZATION & EDIT STATE
// ======================================================

const editingInvoiceIndex = localStorage.getItem("editingInvoiceIndex");
const editingInvoice = JSON.parse(localStorage.getItem("editingInvoice"));

function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const randomNumber = Math.floor(100 + Math.random() * 900);
    return `INV-${year}${month}${day}-${randomNumber}`;
}

if (!editingInvoice) {
    document.querySelector("#invoiceNumber").value = generateInvoiceNumber();
    document.querySelector("#invoiceDate").valueAsDate = new Date();
}

// ======================================================
// CURRENCY & FORMATTING
// ======================================================

currencySelect.addEventListener("change", (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    activeCurrency.code = selectedOption.value;
    activeCurrency.symbol = selectedOption.getAttribute("data-symbol");
    calculateTotals();
});

function formatMoney(amount) {
    return `${activeCurrency.symbol}${Number(amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

// ======================================================
// ITEMS MANAGEMENT
// ======================================================

function createItemRow(name = "", desc = "", qty = 1, price = 0) {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
        <div class="item-desc-col">
            <input type="text" class="item-name" placeholder="Item / Service Name" value="${name}">
            <input type="text" class="item-desc" placeholder="Description (optional)" value="${desc}">
        </div>
        <div>
            <input type="number" class="item-qty" min="1" value="${qty}">
        </div>
        <div>
            <input type="number" class="item-price" min="0" placeholder="0.00" value="${price}">
        </div>
        <div class="item-calc-val item-total">${formatMoney(qty * price)}</div>
        <div style="text-align: right;">
            <button type="button" class="btn-icon-danger remove-item">×</button>
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

    const taxRate = Number(document.querySelector("#taxRate").value) || 0;
    const tax = subtotal * (taxRate / 100);
    const grandTotal = subtotal + tax;

    document.querySelector("#subtotal").textContent = formatMoney(subtotal);
    document.querySelector("#tax").textContent = formatMoney(tax);
    document.querySelector("#grandTotal").textContent = formatMoney(grandTotal);
}

// ======================================================
// CLIENT PRESETS
// ======================================================

function loadClientPresets() {
    const presets = JSON.parse(localStorage.getItem("clientPresets")) || [];
    clientPresetSelect.innerHTML = '<option value="">-- Select Saved Client --</option>';
    presets.forEach((client, index) => {
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = client.name;
        clientPresetSelect.appendChild(opt);
    });
}

saveClientPresetBtn.addEventListener("click", () => {
    const name = document.querySelector("#customerName").value.trim();
    const email = document.querySelector("#customerEmail").value.trim();
    const address = document.querySelector("#customerAddress").value.trim();

    if (!name) return alert("Please enter a customer name to save.");

    const presets = JSON.parse(localStorage.getItem("clientPresets")) || [];
    presets.push({ name, email, address });
    localStorage.setItem("clientPresets", JSON.stringify(presets));
    loadClientPresets();
    alert("Client preset saved!");
});

clientPresetSelect.addEventListener("change", (e) => {
    const index = e.target.value;
    if (index === "") return;
    const presets = JSON.parse(localStorage.getItem("clientPresets")) || [];
    const client = presets[index];

    if (client) {
        document.querySelector("#customerName").value = client.name;
        document.querySelector("#customerEmail").value = client.email;
        document.querySelector("#customerAddress").value = client.address;
    }
});

loadClientPresets();

// Load initial row if empty
if (!editingInvoice) createItemRow();

// ======================================================
// GENERATE / PREVIEW INVOICE
// ======================================================

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const customerName = document.querySelector("#customerName").value.trim();
    if (!customerName) return alert("Please enter the customer's name.");

    // Update document preview fields
    document.querySelector("#previewCustomerName").textContent = customerName;
    document.querySelector("#previewInvoiceNumber").textContent = document.querySelector("#invoiceNumber").value;
    document.querySelector("#previewInvoiceDate").textContent = document.querySelector("#invoiceDate").value;
    document.querySelector("#previewCurrencyText").textContent = `${activeCurrency.code} (${activeCurrency.symbol})`;

    // Items
    const previewItems = document.querySelector("#previewItems");
    previewItems.innerHTML = "";
    document.querySelectorAll(".item-row").forEach(row => {
        const name = row.querySelector(".item-name").value || "Service item";
        const desc = row.querySelector(".item-desc").value;
        const qty = Number(row.querySelector(".item-qty").value) || 0;
        const price = Number(row.querySelector(".item-price").value) || 0;
        const total = qty * price;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <strong>${name}</strong>
                ${desc ? `<br><small style="color:#666;">${desc}</small>` : ''}
            </td>
            <td class="text-right">${formatMoney(total)}</td>
        `;
        previewItems.appendChild(tr);
    });

    document.querySelector("#previewGrandTotal").textContent = document.querySelector("#grandTotal").textContent;
    document.querySelector("#previewBankName").textContent = document.querySelector("#bankName").value || "---";
    document.querySelector("#previewAccountName").textContent = document.querySelector("#accountName").value || "---";
    document.querySelector("#previewAccountNumber").textContent = document.querySelector("#accountNumber").value || "---";
    document.querySelector("#previewTermsText").textContent = document.querySelector("#invoiceTerms").value || "Payment required upon completion.";
    document.querySelector("#previewInvoiceNotes").textContent = document.querySelector("#invoiceNotes").value || "Thanks for your business.";

    const preview = document.querySelector("#invoicePreview");
    preview.style.display = "block";
    preview.scrollIntoView({ behavior: "smooth" });
});

// ======================================================
// SAVE INVOICE (LOCAL STORAGE)
// ======================================================

document.querySelector("#saveInvoice").addEventListener("click", () => {
    const invoiceData = {
        invoiceNumber: document.querySelector("#invoiceNumber").value,
        invoiceDate: document.querySelector("#invoiceDate").value,
        dueDate: document.querySelector("#dueDate").value,
        currency: activeCurrency,
        business: {
            name: document.querySelector("#businessName").value,
            email: document.querySelector("#businessEmail").value,
            phone: document.querySelector("#businessPhone").value,
            address: document.querySelector("#businessAddress").value
        },
        customer: {
            name: document.querySelector("#customerName").value,
            email: document.querySelector("#customerEmail").value,
            address: document.querySelector("#customerAddress").value
        },
        payment: {
            bankName: document.querySelector("#bankName").value,
            accountName: document.querySelector("#accountName").value,
            accountNumber: document.querySelector("#accountNumber").value
        },
        notes: document.querySelector("#invoiceNotes").value,
        terms: document.querySelector("#invoiceTerms").value,
        taxRate: document.querySelector("#taxRate").value,
        items: Array.from(document.querySelectorAll(".item-row")).map(row => ({
            name: row.querySelector(".item-name").value,
            desc: row.querySelector(".item-desc").value,
            quantity: row.querySelector(".item-qty").value,
            price: row.querySelector(".item-price").value
        })),
        total: document.querySelector("#grandTotal").textContent,
        savedAt: new Date().toISOString()
    };

    const savedInvoices = JSON.parse(localStorage.getItem("invoices")) || [];

    if (editingInvoiceIndex !== null) {
        savedInvoices[Number(editingInvoiceIndex)] = invoiceData;
        localStorage.removeItem("editingInvoice");
        localStorage.removeItem("editingInvoiceIndex");
    } else {
        savedInvoices.push(invoiceData);
    }

    localStorage.setItem("invoices", JSON.stringify(savedInvoices));
    alert("Invoice saved successfully!");
    window.location.href = "/history.html";
});

// ======================================================
// DOWNLOAD PDF
// ======================================================

document.querySelector("#downloadPDF").addEventListener("click", async () => {
    const preview = document.querySelector("#invoicePreview");
    if (preview.style.display === "none") return alert("Please generate the invoice first.");

    try {
        const sheet = document.querySelector(".document-sheet");
        const canvas = await html2canvas(sheet, { scale: 2, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jspdf.jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${document.querySelector("#invoiceNumber").value}.pdf`);
    } catch (err) {
        console.error(err);
        alert("Error generating PDF.");
    }
});

// ======================================================
// EDIT MODE LOAD
// ======================================================

if (editingInvoice) {
    document.querySelector("#invoiceNumber").value = editingInvoice.invoiceNumber || "";
    document.querySelector("#invoiceDate").value = editingInvoice.invoiceDate || "";
    document.querySelector("#dueDate").value = editingInvoice.dueDate || "";
    document.querySelector("#businessName").value = editingInvoice.business?.name || "";
    document.querySelector("#businessEmail").value = editingInvoice.business?.email || "";
    document.querySelector("#businessPhone").value = editingInvoice.business?.phone || "";
    document.querySelector("#businessAddress").value = editingInvoice.business?.address || "";
    document.querySelector("#customerName").value = editingInvoice.customer?.name || "";
    document.querySelector("#customerEmail").value = editingInvoice.customer?.email || "";
    document.querySelector("#customerAddress").value = editingInvoice.customer?.address || "";
    document.querySelector("#bankName").value = editingInvoice.payment?.bankName || "";
    document.querySelector("#accountName").value = editingInvoice.payment?.accountName || "";
    document.querySelector("#accountNumber").value = editingInvoice.payment?.accountNumber || "";
    document.querySelector("#invoiceNotes").value = editingInvoice.notes || "";
    document.querySelector("#invoiceTerms").value = editingInvoice.terms || "";
    document.querySelector("#taxRate").value = editingInvoice.taxRate || 0;

    if (editingInvoice.currency) {
        currencySelect.value = editingInvoice.currency.code;
        activeCurrency = editingInvoice.currency;
    }

    itemsContainer.innerHTML = "";
    editingInvoice.items?.forEach(item => {
        createItemRow(item.name, item.desc, item.quantity, item.price);
    });
}