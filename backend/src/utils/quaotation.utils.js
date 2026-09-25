
// Get the first available value from possible column names
const getValue = (item, possibleKeys) => {
    for (const key of possibleKeys) {
        if (
            item[key] !== undefined &&
            item[key] !== null &&
            item[key] !== ""
        ) {
            return item[key];
        }
    }

    return "";
};


// Convert value to number; use 0 if invalid
const toNumber = (value, defaultValue = 0) => {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : defaultValue;
};


// Convert Excel rows into a standard item structure
export const normalizeExcelItems = (rows) => {
    return rows.map((row) => ({
        itemName: getValue(row, [
            "Item",
            "Item Name",
            "Product",
            "Product Name",
            "Description"
        ]),

        quantity: getValue(row, [
            "Qty",
            "Quantity",
            "Units"
        ]),

        unit: getValue(row, [
            "Unit",
            "UOM"
        ]),

        unitPrice: getValue(row, [
            "Unit Price",
            "Price",
            "Rate",
            "UnitPrice"
        ]),

        tax: getValue(row, [
            "Tax",
            "Tax %"
        ]),

        discount: getValue(row, [
            "Discount",
            "Discount %"
        ])
    }));
};


// Create final quotation with calculated totals
export const createQuotationStructure = ({
    quotationNumber = "",
    quotationDate = null,
    validUntil = null,
    vendor = "",
    items = []
}) => {

    // Clean values and calculate each item's total
    const normalizedItems = items.map((item) => {
        const quantity = toNumber(item.quantity);
        const unitPrice = toNumber(item.unitPrice);
        const tax = toNumber(item.tax);
        const discount = toNumber(item.discount);

        const subtotal = quantity * unitPrice;

        const taxAmount =
            subtotal * (tax / 100);

        const discountAmount =
            subtotal * (discount / 100);

        const total =
            subtotal +
            taxAmount -
            discountAmount;

        return {
            itemName: String(
                item.itemName || ""
            ).trim(),

            quantity,
            unit: String(
                item.unit || ""
            ).trim(),

            unitPrice,
            tax,
            discount,
            subtotal,
            total
        };
    });

    // Add all item totals to get quotation total
    const grandTotal = normalizedItems.reduce(
        (sum, item) => sum + item.total,
        0
    );

    return {
        quotationNumber: String(
            quotationNumber
        ).trim(),

        quotationDate,
        validUntil,

        vendor: String(
            vendor
        ).trim(),

        items: normalizedItems,

        grandTotal
    };
};

