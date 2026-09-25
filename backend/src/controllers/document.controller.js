import Quotation from "../models/Quotation.model.js";
import { extractTextFromPdf } from "../utils/pdf.utils.js";
import { extractDataFromExcel } from "../utils/excel.pdf.js";

export const extractQuotationPdfText = async (req, res) => {
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

        if (quotation.document.mimeType !== "application/pdf") {
            return res.status(400).json({
                success: false,
                message: "Only PDF documents can be processed by this endpoint"
            });
        }

        const extractedText = await extractTextFromPdf(
            quotation.document.filePath
        );

        if (!extractedText) {
            return res.status(400).json({
                success: false,
                message: "No readable text found in the PDF"
            });
        }

        return res.status(200).json({
            success: true,
            message: "PDF text extracted successfully",
            data: {
                quotationId: quotation._id,
                fileName: quotation.document.originalName,
                text: extractedText
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to process PDF",
            error: error.message
        });
    }
};

export const extractQuotationExcelData = async (req, res) => {
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

        const allowedExcelTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel"
        ];

        if (!allowedExcelTypes.includes(quotation.document.mimeType)) {
            return res.status(400).json({
                success: false,
                message: "Only Excel documents can be processed by this endpoint"
            });
        }

        const extractedData = extractDataFromExcel(
            quotation.document.filePath
        );

        return res.status(200).json({
            success: true,
            message: "Excel data extracted successfully",
            data: {
                quotationId: quotation._id,
                fileName: quotation.document.originalName,
                sheets: extractedData
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to process Excel document",
            error: error.message
        });
    }
};