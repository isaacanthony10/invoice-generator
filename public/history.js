const invoiceHistory =
    document.querySelector("#invoiceHistory");

const savedInvoices =
    JSON.parse(localStorage.getItem("invoices")) || [];


if (savedInvoices.length === 0) {

    invoiceHistory.innerHTML = `
        <p>No invoices saved yet.</p>
    `;

} else {

    savedInvoices.forEach((invoice, index) => {

        const invoiceCard =
            document.createElement("div");

        invoiceCard.className = "invoice-card";

        invoiceCard.innerHTML = `
            <h3>
                ${invoice.invoiceNumber}
            </h3>

            <p>
                Customer:
                ${invoice.customer.name || "No customer"}
            </p>

            <p>
                Date:
                ${invoice.invoiceDate || "No date"}
            </p>

            <p>
                Total:
                ${invoice.total}
            </p>

            <button
                type="button"
                onclick="viewInvoice(${index})"
            >
                View
            </button>

            <button
                type="button"
                onclick="editInvoice(${index})"
            >
                Edit
            </button>

            <button
                type="button"
                onclick="deleteInvoice(${index})"
            >
                Delete
            </button>
        `;

        invoiceHistory.appendChild(invoiceCard);

    });

}


function deleteInvoice(index) {

    const confirmDelete =
        confirm("Are you sure you want to delete this invoice?");

    if (!confirmDelete) {
        return;
    }

    savedInvoices.splice(index, 1);

    localStorage.setItem(
        "invoices",
        JSON.stringify(savedInvoices)
    );

    location.reload();
}

function viewInvoice(index) {

    localStorage.setItem(
        "selectedInvoice",
        JSON.stringify(savedInvoices[index])
    );

    window.location.href = "/view-invoice.html";

}

function editInvoice(index) {

    localStorage.setItem(
        "editingInvoice",
        JSON.stringify(savedInvoices[index])
    );

    localStorage.setItem(
        "editingInvoiceIndex",
        index
    );

    window.location.href = "/";
}