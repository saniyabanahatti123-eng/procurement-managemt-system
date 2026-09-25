import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const extractQuotationWithAI = async (documentText) => {
    if (!documentText || !documentText.trim()) {
        throw new Error("Document text is required for AI extraction");
    }

    const prompt = `
You are a quotation data extraction assistant.

Extract quotation information from the document text below.

Return ONLY valid JSON.

Use exactly this structure:

{
    "quotationNumber": "",
    "quotationDate": null,
    "validUntil": null,
    "vendor": {
        "name": "",
        "email": "",
        "phone": ""
    },
    "items": [
        {
            "itemName": "",
            "description": "",
            "quantity": 0,
            "unit": "",
            "unitPrice": 0,
            "tax": 0,
            "discount": 0,
            "subtotal": 0,
            "total": 0
        }
    ],
    "grandTotal": 0,
    "currency": ""
}

Rules:
- Do not invent missing information.
- Use empty strings when text information is unavailable.
- Use 0 when numeric information is unavailable.
- Use null when a date is unavailable.
- quantity, unitPrice, tax, discount, subtotal and total must be numbers.
- grandTotal must be a number.
- Preserve the quotation's currency when available.
- Extract every identifiable quotation item.

Document text:

${documentText}
`;

    const response = await openai.responses.create({
        model: "gpt-5.4-mini",
        input: prompt
    });

    return response.output_text;
};