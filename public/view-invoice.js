const invoiceContainer =
    document.querySelector("#savedInvoice");

const invoice =
    JSON.parse(localStorage.getItem("selectedInvoice"));


if (!invoice) {

    invoiceContainer.innerHTML = `
        <h2>Invoice not found</h2>
        <p>Please return to invoice history.</p>
    `;

} else {

    invoiceContainer.innerHTML = `

        <div id="invoicePreview">

            <div class="invoice-header">

                <div>

                    <h2>
                        ${invoice.business.name || "Business Name"}
                    </h2>

                    <p>
                        ${invoice.business.email || ""}
                    </p>

                    <p>
                        ${invoice.business.phone || ""}
                    </p>

                    <p>
                        ${invoice.business.address || ""}
                    </p>

                </div>


                <div>

                    <h1>INVOICE</h1>

                    <p>
                        Invoice #:
                        ${invoice.invoiceNumber}
                    </p>

                    <p>
                        Date:
                        ${invoice.invoiceDate}
                    </p>

                    <p>
                        Due:
                        ${invoice.dueDate}
                    </p>

                </div>

            </div>


            <div class="customer-section">

                <h3>BILL TO</h3>

                <p>
                    ${invoice.customer.name || ""}
                </p>

                <p>
                    ${invoice.customer.email || ""}
                </p>

                <p>
                    ${invoice.customer.address || ""}
                </p>

            </div>


            <table>

                <thead>

                    <tr>
                        <th>Item / Service</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>

                </thead>

                <tbody>

                    ${invoice.items.map(item => `

                        <tr>

                            <td>
                                ${item.name || "Item / Service"}
                            </td>

                            <td>
                                ${item.quantity}
                            </td>

                            <td>
                                ₦${Number(item.price).toLocaleString("en-NG", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </td>

                            <td>
                                ₦${(
                                    Number(item.quantity) *
                                    Number(item.price)
                                ).toLocaleString("en-NG", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>


            <div class="invoice-summary">

                <p>
                    Subtotal:
                    <span>${invoice.subtotal}</span>
                </p>

                <p>
                    Tax:
                    <span>${invoice.tax}</span>
                </p>

                <h3>
                    Total:
                    <span>${invoice.total}</span>
                </h3>

            </div>

        </div>

    `;
}