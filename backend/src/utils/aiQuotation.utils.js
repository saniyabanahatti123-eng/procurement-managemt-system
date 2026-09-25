//AI PSARSE RESULT provide clean result - AVOIDE JSON ETC.....

export const parseAIQuotationResult = (rawResult) => {
    if (!rawResult || typeof rawResult !== "string") {
        throw new Error("AI returned an empty result");
    }

    try {
        const cleanedResult = rawResult
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        const parsedResult = JSON.parse(cleanedResult);

        return parsedResult;
    } catch (error) {
        throw new Error(
            `Failed to parse AI quotation result: ${error.message}`
        );
    }
};
// empty quatation strcture

export const getEmptyQuotationExtraction = () => {
    return {
        quotationNumber: "",
        quotationDate: null,
        validUntil: null,

        vendor: {
            name: "",
            email: "",
            phone: ""
        },

        items: [],

        grandTotal: 0,
        currency: ""
    };
};



export const validateQuotationExtraction = (data) => {
    if (!data || typeof data !== "object") {
        return {
            valid: false,
            message: "AI extraction result must be an object"
        };
    }

    if (
        data.quotationNumber !== undefined &&
        typeof data.quotationNumber !== "string"
    ) {
        return {
            valid: false,
            message: "Quotation number must be a string"
        };
    }

    if (!data.vendor || typeof data.vendor !== "object") {
        return {
            valid: false,
            message: "Vendor information must be an object"
        };
    }

    if (
        data.vendor.name !== undefined &&
        typeof data.vendor.name !== "string"
    ) {
        return {
            valid: false,
            message: "Vendor name must be a string"
        };
    }

    if (!Array.isArray(data.items)) {
        return {
            valid: false,
            message: "Quotation items must be an array"
        };
    }

    for (const item of data.items) {
        if (!item || typeof item !== "object") {
            return {
                valid: false,
                message: "Invalid quotation item"
            };
        }

        if (
            !item.itemName ||
            typeof item.itemName !== "string"
        ) {
            return {
                valid: false,
                message: "Every quotation item must have an item name"
            };
        }

        if (
            typeof item.quantity !== "number" ||
            item.quantity < 0
        ) {
            return {
                valid: false,
                message:
                    `Invalid quantity for item: ${item.itemName}`
            };
        }

        if (
            typeof item.unitPrice !== "number" ||
            item.unitPrice < 0
        ) {
            return {
                valid: false,
                message:
                    `Invalid unit price for item: ${item.itemName}`
            };
        }

        if (
            typeof item.tax !== "number" ||
            item.tax < 0
        ) {
            return {
                valid: false,
                message:
                    `Invalid tax for item: ${item.itemName}`
            };
        }

        if (
            typeof item.discount !== "number" ||
            item.discount < 0
        ) {
            return {
                valid: false,
                message:
                    `Invalid discount for item: ${item.itemName}`
            };
        }
    }

    if (
        typeof data.grandTotal !== "number" ||
        data.grandTotal < 0
    ) {
        return {
            valid: false,
            message: "Invalid quotation grand total"
        };
    }

    return {
        valid: true,
        message: "Quotation extraction is valid"
    };
};