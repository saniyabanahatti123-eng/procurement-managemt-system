const normalizeText = (value) => {
    return String(value || "").trim().toLowerCase();
};

const normalizeNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : 0;
};

// Convert item values into one consistent format
export const normalizeQuotationItems = (items = []) => {
    return items.map((item) => ({
        itemName: normalizeText(item.itemName),
        description: String(item.description || "").trim(),
        quantity: normalizeNumber(item.quantity),
        unit: normalizeText(item.unit),
        unitPrice: normalizeNumber(item.unitPrice),
        tax: normalizeNumber(item.tax),
        discount: normalizeNumber(item.discount),
        subtotal: normalizeNumber(item.subtotal),
        total: normalizeNumber(item.total)
    }));
};

export const createNormalizedQuotation = (extractedData) => {
    return {
        quotationNumber: String(
            extractedData.quotationNumber || ""
        ).trim(),

        quotationDate: extractedData.quotationDate || null,
        validUntil: extractedData.validUntil || null,

        vendor: {
            name: String(extractedData.vendor?.name || "").trim(),
            email: String(extractedData.vendor?.email || "").trim(),
            phone: String(extractedData.vendor?.phone || "").trim()
        },

        items: normalizeQuotationItems(extractedData.items),

        grandTotal: normalizeNumber(extractedData.grandTotal),
        currency: String(extractedData.currency || "").trim().toUpperCase()
    };
};

export const validateNormalizedQuotation = (quotation) => {
    if (!quotation || typeof quotation !== "object") {
        return {
            valid: false,
            message: "Normalized quotation data is required"
        };
    }

    if (!quotation.vendor?.name) {
        return {
            valid: false,
            message: "Vendor name is required"
        };
    }

    if (!Array.isArray(quotation.items) || quotation.items.length === 0) {
        return {
            valid: false,
            message: "At least one quotation item is required"
        };
    }

    for (const item of quotation.items) {
        if (!item.itemName) {
            return {
                valid: false,
                message: "Item name is required"
            };
        }

        if (item.quantity <= 0) {
            return {
                valid: false,
                message: `Invalid quantity for item: ${item.itemName}`
            };
        }

        if (item.unitPrice < 0) {
            return {
                valid: false,
                message: `Invalid unit price for item: ${item.itemName}`
            };
        }
    }

    if (quotation.grandTotal < 0) {
        return {
            valid: false,
            message: "Grand total cannot be negative"
        };
    }

    return {
        valid: true,
        message: "Normalized quotation is valid"
    };
};