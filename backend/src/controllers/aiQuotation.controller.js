import Quotation from "../models/Quotation.model.js";

import {
    extractTextFromPdf
} from "../utils/pdf.utils.js";

import {
    extractQuotationWithAI
} from "../services/aiQuotation.service.js";

import {
    parseAndValidateQuotation
} from "../utils/aiQuotation.utils.js";

export const extractQuotationWithAIController = async (req, res) => {
    try {
        const { id } = req.params;

        const quotation = await Quotation.findById(id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found"
            });
        }

        if (!quotation.document) {
            return res.status(400).json({
                success: false,
                message: "Quotation document not found"
            });
        }

        if (
            quotation.document.mimeType !==
            "application/pdf"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "AI extraction currently supports PDF quotations"
            });
        }

        const documentText =
            await extractTextFromPdf(
                quotation.document.filePath
            );

        if (!documentText) {
            return res.status(400).json({
                success: false,
                message:
                    "No readable text found in quotation document"
            });
        }

        const aiResult =
            await extractQuotationWithAI(
                documentText
            );

        const extractedData =
            parseAndValidateQuotation(aiResult);

        quotation.extractedData = extractedData;

        const updatedQuotation =
            await quotation.save();

        return res.status(200).json({
            success: true,
            message:
                "Quotation data extracted and saved successfully",

            data: {
                quotationId: updatedQuotation._id,
                extractedData:
                    updatedQuotation.extractedData
            }
        });

    } catch (error) {
        console.error(
            "AI quotation extraction error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to extract quotation data using AI",
            error: error.message
        });
    }
};