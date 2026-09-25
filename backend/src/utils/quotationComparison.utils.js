// Compare group of questions
export const matchQuotationItems = (quotations) => {
    const itemMap = new Map();

    // Group the same item from all quotations
    for (const quotation of quotations) {
        for (const item of quotation.items) {
            const key = item.itemName.toLowerCase().trim();

            if (!itemMap.has(key)) {
                itemMap.set(key, {
                    itemName: item.itemName,
                    quotations: []
                });
            }

            itemMap.get(key).quotations.push({
                quotationId: quotation.id,
                vendor: quotation.vendor,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: item.unitPrice,
                tax: item.tax,
                discount: item.discount,
                total: item.total
            });
        }
    }

    return Array.from(itemMap.values());
};


export const calculateQuotationTotal = (quotation) => {
    return quotation.items.reduce((total, item) => {
        return total + Number(item.total || 0);
    }, 0);
};

export const calculateAllQuotationTotals = (quotations) => {
    return quotations.map((quotation) => ({
        quotationId: quotation.id,
        vendor: quotation.vendor,
        total: calculateQuotationTotal(quotation)
    }));
};

// generate quotationComparison
export const generateQuotationComparison = (quotations) => {
    if (!quotations || quotations.length < 2) {
        throw new Error(
            "At least two quotations are required for comparison"
        );
    }

    const items = matchQuotationItems(quotations);
    const totals = calculateAllQuotationTotals(quotations);

    return {
        quotationCount: quotations.length,
        quotations: quotations.map((quotation) => ({
            quotationId: quotation.id,
            vendor: quotation.vendor
        })),
        items,
        totals
    };
};