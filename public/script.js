const form = document.querySelector("form");
const addItemButton = document.querySelector("#addItem");
const invoiceNumberInput = document.querySelector("#invoiceNumber");


// ======================================================
// EDITING STATE
// ======================================================

const editingInvoiceIndex =
    localStorage.getItem("editingInvoiceIndex");

const editingInvoice =
    JSON.parse(localStorage.getItem("editingInvoice"));


// ======================================================
// INVOICE NUMBER
// ======================================================

function generateInvoiceNumber() {

    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const randomNumber =
        Math.floor(100 + Math.random() * 900);

    return `INV-${year}${month}${day}-${randomNumber}`;
}


// Only generate a new number when creating a new invoice
if (!editingInvoice) {
    invoiceNumberInput.value = generateInvoiceNumber();
}


// ======================================================
// CALCULATE TOTALS
// ======================================================

function calculateTotals() {

    const items =
        document.querySelectorAll(".item");

    let subtotal = 0;

    items.forEach(item => {

        const quantityInput =
            item.querySelector(".quantity");

        const priceInput =
            item.querySelector(".price");

        const itemTotal =
            item.querySelector(".item-total");

        const quantity =
            Number(quantityInput.value) || 0;

        const price =
            Number(priceInput.value) || 0;

        const total =
            quantity * price;

        subtotal += total;

        itemTotal.textContent =
            `₦${total.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

    });


    const taxRate =
        Number(
            document.querySelector("#taxRate").value
        ) || 0;

    const tax =
        subtotal * (taxRate / 100);

    const grandTotal =
        subtotal + tax;


    document.querySelector("#subtotal").textContent =
        `₦${subtotal.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;


    document.querySelector("#tax").textContent =
        `₦${tax.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;


    document.querySelector("#grandTotal").textContent =
        `₦${grandTotal.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
}


// ======================================================
// ADD ITEM
// ======================================================

addItemButton.addEventListener("click", () => {

    const item =
        document.createElement("div");

    item.className = "item";

    item.innerHTML = `
        <input
            type="text"
            placeholder="Item / Service"
        >

        <input
            type="number"
            placeholder="Quantity"
            min="1"
            value="1"
            class="quantity"
        >

        <input
            type="number"
            placeholder="Price"
            min="0"
            class="price"
        >

        <span class="item-total">
            ₦0.00
        </span>

        <button
            type="button"
            class="remove-item"
        >
            Remove
        </button>
    `;

    form.insertBefore(item, addItemButton);

    calculateTotals();
});


// ======================================================
// CALCULATE WHEN USER TYPES
// ======================================================

form.addEventListener(
    "input",
    calculateTotals
);


// ======================================================
// REMOVE ITEM
// ======================================================

form.addEventListener("click", event => {

    if (
        event.target.classList.contains(
            "remove-item"
        )
    ) {

        const item =
            event.target.closest(".item");

        item.remove();

        calculateTotals();
    }

});


// ======================================================
// GENERATE INVOICE
// ======================================================

form.addEventListener("submit", event => {

    event.preventDefault();


    // ------------------------------
    // BASIC INFORMATION
    // ------------------------------

    const businessName =
        document
            .querySelector("#businessName")
            .value
            .trim();

    const customerName =
        document
            .querySelector("#customerName")
            .value
            .trim();

    const invoiceDate =
        document.querySelector(
            "#invoiceDate"
        ).value;


    // ------------------------------
    // VALIDATION
    // ------------------------------

    if (!businessName) {

        alert(
            "Please enter your business name."
        );

        return;
    }


    if (!customerName) {

        alert(
            "Please enter the customer's name."
        );

        return;
    }


    if (!invoiceDate) {

        alert(
            "Please select an invoice date."
        );

        return;
    }


    const invoiceItems =
        document.querySelectorAll(".item");


    if (invoiceItems.length === 0) {

        alert(
            "Please add at least one item."
        );

        return;
    }


    // ------------------------------
    // VALIDATE ITEMS
    // ------------------------------

    for (const item of invoiceItems) {

        const itemName =
            item
                .querySelector(
                    "input[type='text']"
                )
                .value
                .trim();

        const quantity =
            Number(
                item.querySelector(
                    ".quantity"
                ).value
            );

        const price =
            Number(
                item.querySelector(
                    ".price"
                ).value
            );


        if (!itemName) {

            alert(
                "Please enter a name for every item."
            );

            return;
        }


        if (quantity <= 0) {

            alert(
                "Quantity must be greater than 0."
            );

            return;
        }


        if (
            price < 0 ||
            isNaN(price)
        ) {

            alert(
                "Price cannot be negative."
            );

            return;
        }

    }


    // ==================================================
    // UPDATE PREVIEW
    // ==================================================

    document.querySelector(
        "#previewBusinessName"
    ).textContent =
        document.querySelector(
            "#businessName"
        ).value ||
        "Business Name";


    document.querySelector(
        "#previewBusinessEmail"
    ).textContent =
        document.querySelector(
            "#businessEmail"
        ).value ||
        "business@email.com";


    document.querySelector(
        "#previewBusinessPhone"
    ).textContent =
        document.querySelector(
            "#businessPhone"
        ).value ||
        "0800 000 0000";


    document.querySelector(
        "#previewBusinessAddress"
    ).textContent =
        document.querySelector(
            "#businessAddress"
        ).value ||
        "Business Address";


    // ------------------------------
    // CUSTOMER
    // ------------------------------

    document.querySelector(
        "#previewCustomerName"
    ).textContent =
        document.querySelector(
            "#customerName"
        ).value ||
        "Customer Name";


    document.querySelector(
        "#previewCustomerEmail"
    ).textContent =
        document.querySelector(
            "#customerEmail"
        ).value ||
        "customer@email.com";


    document.querySelector(
        "#previewCustomerAddress"
    ).textContent =
        document.querySelector(
            "#customerAddress"
        ).value ||
        "Customer Address";


    // ------------------------------
    // PAYMENT
    // ------------------------------

    document.querySelector(
        "#previewBankName"
    ).textContent =
        document.querySelector(
            "#bankName"
        ).value ||
        "---";


    document.querySelector(
        "#previewAccountName"
    ).textContent =
        document.querySelector(
            "#accountName"
        ).value ||
        "---";


    document.querySelector(
        "#previewAccountNumber"
    ).textContent =
        document.querySelector(
            "#accountNumber"
        ).value ||
        "---";


    // ------------------------------
    // INVOICE DETAILS
    // ------------------------------

    document.querySelector(
        "#previewInvoiceNumber"
    ).textContent =
        document.querySelector(
            "#invoiceNumber"
        ).value ||
        "---";


    document.querySelector(
        "#previewInvoiceDate"
    ).textContent =
        document.querySelector(
            "#invoiceDate"
        ).value ||
        "---";


    document.querySelector(
        "#previewDueDate"
    ).textContent =
        document.querySelector(
            "#dueDate"
        ).value ||
        "---";


    // ------------------------------
    // NOTES & TERMS
    // ------------------------------

    document.querySelector(
        "#previewInvoiceNotes"
    ).textContent =
        document.querySelector(
            "#invoiceNotes"
        ).value ||
        "---";


    document.querySelector(
        "#previewInvoiceTerms"
    ).textContent =
        document.querySelector(
            "#invoiceTerms"
        ).value ||
        "---";


    // ==================================================
    // ITEMS PREVIEW
    // ==================================================

    const previewItems =
        document.querySelector(
            "#previewItems"
        );

    previewItems.innerHTML = "";


    invoiceItems.forEach(item => {

        const itemName =
            item
                .querySelector(
                    "input[type='text']"
                )
                .value ||
            "Item / Service";


        const quantity =
            Number(
                item.querySelector(
                    ".quantity"
                ).value
            ) || 0;


        const price =
            Number(
                item.querySelector(
                    ".price"
                ).value
            ) || 0;


        const total =
            quantity * price;


        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td>${itemName}</td>

            <td>${quantity}</td>

            <td>
                ₦${price.toLocaleString(
                    "en-NG",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )}
            </td>

            <td>
                ₦${total.toLocaleString(
                    "en-NG",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )}
            </td>
        `;


        previewItems.appendChild(row);

    });


    // ==================================================
    // TOTALS PREVIEW
    // ==================================================

    document.querySelector(
        "#previewSubtotal"
    ).textContent =
        document.querySelector(
            "#subtotal"
        ).textContent;


    document.querySelector(
        "#previewTax"
    ).textContent =
        document.querySelector(
            "#tax"
        ).textContent;


    document.querySelector(
        "#previewGrandTotal"
    ).textContent =
        document.querySelector(
            "#grandTotal"
        ).textContent;


    // ==================================================
    // SHOW PREVIEW
    // ==================================================

    const invoicePreview =
        document.querySelector(
            "#invoicePreview"
        );


    invoicePreview.style.display =
        "block";


    invoicePreview.scrollIntoView({
        behavior: "smooth"
    });

});


// ======================================================
// DOWNLOAD PDF
// ======================================================

const downloadPDFButton = document.querySelector("#downloadPDF");

downloadPDFButton.addEventListener("click", async () => {

    const invoicePreview = document.querySelector("#invoicePreview");
    const invoiceNotes = document.querySelector(".invoice-notes");

    if (invoicePreview.style.display === "none") {
        alert("Please generate the invoice first.");
        return;
    }

    const businessName =
        document.querySelector("#businessName").value.trim() || "Invoice";

    try {

        // Create a temporary container containing the FULL invoice
        const pdfContainer = document.createElement("div");

        pdfContainer.style.position = "absolute";
        pdfContainer.style.left = "-99999px";
        pdfContainer.style.top = "0";
        pdfContainer.style.width = "850px";
        pdfContainer.style.background = "#ffffff";
        pdfContainer.style.padding = "0";
        pdfContainer.style.margin = "0";

        // Clone invoice preview
        const invoiceClone = invoicePreview.cloneNode(true);

        // Make sure the cloned invoice is visible
        invoiceClone.style.display = "block";
        invoiceClone.style.margin = "0";
        invoiceClone.style.boxShadow = "none";

        pdfContainer.appendChild(invoiceClone);

        // Clone notes and terms
        if (invoiceNotes) {

            const notesClone =
                invoiceNotes.cloneNode(true);

            notesClone.style.display = "grid";
            notesClone.style.marginTop = "30px";

            pdfContainer.appendChild(notesClone);
        }

        document.body.appendChild(pdfContainer);

        // Give browser time to render everything
        await new Promise(resolve =>
            setTimeout(resolve, 300)
        );

        const canvas = await html2canvas(pdfContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            width: pdfContainer.scrollWidth,
            height: pdfContainer.scrollHeight,
            windowWidth: pdfContainer.scrollWidth,
            windowHeight: pdfContainer.scrollHeight
        });

        const imageData =
            canvas.toDataURL("image/jpeg", 0.95);

        const pdf = new jspdf.jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const pageWidth = 210;
        const pageHeight = 297;

        const margin = 15;

        const usableWidth =
            pageWidth - (margin * 2);

        const usableHeight =
            pageHeight - (margin * 2);

        const imageHeight =
            (canvas.height * usableWidth) /
            canvas.width;

        let heightLeft = imageHeight;
        let position = margin;

        // First page
        pdf.addImage(
            imageData,
            "JPEG",
            margin,
            position,
            usableWidth,
            imageHeight
        );

        heightLeft -= usableHeight;

        // Additional pages
        while (heightLeft > 0) {

            position =
                margin -
                (imageHeight - heightLeft);

            pdf.addPage();

            pdf.addImage(
                imageData,
                "JPEG",
                margin,
                position,
                usableWidth,
                imageHeight
            );

            heightLeft -= usableHeight;
        }

        pdf.save(`${businessName}-invoice.pdf`);

        // Remove temporary container
        document.body.removeChild(pdfContainer);

    } catch (error) {

        console.error(
            "PDF generation failed:",
            error
        );

        alert("Could not generate the PDF.");
    }

});


// ======================================================
// SAVE INVOICE
// ======================================================

const saveInvoiceButton =
    document.querySelector(
        "#saveInvoice"
    );


saveInvoiceButton.addEventListener(
    "click",
    () => {

        const invoice = {

            invoiceNumber:
                document.querySelector(
                    "#invoiceNumber"
                ).value,

            invoiceDate:
                document.querySelector(
                    "#invoiceDate"
                ).value,

            dueDate:
                document.querySelector(
                    "#dueDate"
                ).value,


            business: {

                name:
                    document.querySelector(
                        "#businessName"
                    ).value,

                email:
                    document.querySelector(
                        "#businessEmail"
                    ).value,

                phone:
                    document.querySelector(
                        "#businessPhone"
                    ).value,

                address:
                    document.querySelector(
                        "#businessAddress"
                    ).value

            },


            customer: {

                name:
                    document.querySelector(
                        "#customerName"
                    ).value,

                email:
                    document.querySelector(
                        "#customerEmail"
                    ).value,

                address:
                    document.querySelector(
                        "#customerAddress"
                    ).value

            },


            payment: {

                bankName:
                    document.querySelector(
                        "#bankName"
                    ).value,

                accountName:
                    document.querySelector(
                        "#accountName"
                    ).value,

                accountNumber:
                    document.querySelector(
                        "#accountNumber"
                    ).value

            },


            notes:
                document.querySelector(
                    "#invoiceNotes"
                ).value,


            terms:
                document.querySelector(
                    "#invoiceTerms"
                ).value,


            taxRate:
                document.querySelector(
                    "#taxRate"
                ).value,


            items:
                Array.from(
                    document.querySelectorAll(
                        ".item"
                    )
                ).map(item => ({

                    name:
                        item.querySelector(
                            "input[type='text']"
                        ).value,

                    quantity:
                        item.querySelector(
                            ".quantity"
                        ).value,

                    price:
                        item.querySelector(
                            ".price"
                        ).value

                })),


            subtotal:
                document.querySelector(
                    "#subtotal"
                ).textContent,


            tax:
                document.querySelector(
                    "#tax"
                ).textContent,


            total:
                document.querySelector(
                    "#grandTotal"
                ).textContent,


            savedAt:
                new Date().toISOString()

        };


        const savedInvoices =
            JSON.parse(
                localStorage.getItem(
                    "invoices"
                )
            ) || [];


        // ==================================================
        // UPDATE EXISTING INVOICE
        // ==================================================

        if (
            editingInvoiceIndex !== null
        ) {

            savedInvoices[
                Number(
                    editingInvoiceIndex
                )
            ] = invoice;


            localStorage.setItem(
                "invoices",
                JSON.stringify(
                    savedInvoices
                )
            );


            localStorage.removeItem(
                "editingInvoice"
            );

            localStorage.removeItem(
                "editingInvoiceIndex"
            );


            alert(
                "Invoice updated successfully!"
            );


            window.location.href =
                "/";

            return;

        }


        // ==================================================
        // SAVE NEW INVOICE
        // ==================================================

        savedInvoices.push(
            invoice
        );


        localStorage.setItem(
            "invoices",
            JSON.stringify(
                savedInvoices
            )
        );


        localStorage.removeItem(
            "editingInvoice"
        );

        localStorage.removeItem(
            "editingInvoiceIndex"
        );


        alert(
            "Invoice saved successfully!"
        );


        window.location.href =
            "/";

    }
);


// ======================================================
// LOAD INVOICE FOR EDITING
// ======================================================

if (editingInvoice) {

    document.querySelector(
        "#businessName"
    ).value =
        editingInvoice.business?.name ||
        "";


    document.querySelector(
        "#businessEmail"
    ).value =
        editingInvoice.business?.email ||
        "";


    document.querySelector(
        "#businessPhone"
    ).value =
        editingInvoice.business?.phone ||
        "";


    document.querySelector(
        "#businessAddress"
    ).value =
        editingInvoice.business?.address ||
        "";


    // ------------------------------
    // CUSTOMER
    // ------------------------------

    document.querySelector(
        "#customerName"
    ).value =
        editingInvoice.customer?.name ||
        "";


    document.querySelector(
        "#customerEmail"
    ).value =
        editingInvoice.customer?.email ||
        "";


    document.querySelector(
        "#customerAddress"
    ).value =
        editingInvoice.customer?.address ||
        "";


    // ------------------------------
    // PAYMENT
    // ------------------------------

    document.querySelector(
        "#bankName"
    ).value =
        editingInvoice.payment?.bankName ||
        "";


    document.querySelector(
        "#accountName"
    ).value =
        editingInvoice.payment?.accountName ||
        "";


    document.querySelector(
        "#accountNumber"
    ).value =
        editingInvoice.payment?.accountNumber ||
        "";


    // ------------------------------
    // INVOICE DETAILS
    // ------------------------------

    document.querySelector(
        "#invoiceNumber"
    ).value =
        editingInvoice.invoiceNumber ||
        "";


    document.querySelector(
        "#invoiceDate"
    ).value =
        editingInvoice.invoiceDate ||
        "";


    document.querySelector(
        "#dueDate"
    ).value =
        editingInvoice.dueDate ||
        "";


    document.querySelector(
        "#taxRate"
    ).value =
        editingInvoice.taxRate ||
        0;


    // ------------------------------
    // NOTES & TERMS
    // ------------------------------

    document.querySelector(
        "#invoiceNotes"
    ).value =
        editingInvoice.notes ||
        "";


    document.querySelector(
        "#invoiceTerms"
    ).value =
        editingInvoice.terms ||
        "";


    // ------------------------------
    // REMOVE DEFAULT ITEM
    // ------------------------------

    document
        .querySelectorAll(".item")
        .forEach(item => {
            item.remove();
        });


    // ------------------------------
    // RESTORE SAVED ITEMS
    // ------------------------------

    editingInvoice.items.forEach(
        savedItem => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "item";


            item.innerHTML = `
                <input
                    type="text"
                    placeholder="Item / Service"
                    value="${savedItem.name}"
                >

                <input
                    type="number"
                    placeholder="Quantity"
                    min="1"
                    value="${savedItem.quantity}"
                    class="quantity"
                >

                <input
                    type="number"
                    placeholder="Price"
                    min="0"
                    value="${savedItem.price}"
                    class="price"
                >

                <span class="item-total">
                    ₦0.00
                </span>

                <button
                    type="button"
                    class="remove-item"
                >
                    Remove
                </button>
            `;


            form.insertBefore(
                item,
                addItemButton
            );

        }
    );


    calculateTotals();

}