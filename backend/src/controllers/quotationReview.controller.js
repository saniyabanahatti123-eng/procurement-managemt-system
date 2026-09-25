import Quotation from "../models/Quotation.model.js";
import { validateQuotationExtraction } from "../utils/aiQuotation.utils.js";
import {
    createNormalizedQuotation,
    validateNormalizedQuotation
} from "../utils/quotationNormalization.utils.js";

export const getQuotationForReview = async (req, res) => {
    try {
        const { id } = req.params;

        const quotation = await Quotation.findById(id)
            .populate("request", "title description status")
            .populate("vendor", "name email phone");

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found"
            });
        }

        if (!quotation.extractedData) {
            return res.status(400).json({
                success: false,
                message: "Quotation has not been extracted yet"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Quotation review data retrieved successfully",
            data: {
                quotationId: quotation._id,
                quotationNumber: quotation.quotationNumber,
                quotationDate: quotation.quotationDate,
                validUntil: quotation.validUntil,
                vendor: quotation.vendor,
                document: quotation.document,
                extractedData: quotation.extractedData
            }
        });

    } catch (error) {
        console.error(
            "Quotation review error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve quotation for review"
        });
    }
};

export const updateQuotationReviewData = async (req, res) => {
    try {
        const { id } = req.params;
        const { extractedData } = req.body;

        const quotation = await Quotation.findById(id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found"
            });
        }

        if (!quotation.extractedData) {
            return res.status(400).json({
                success: false,
                message: "Quotation has not been extracted yet"
            });
        }

        if (!extractedData || typeof extractedData !== "object") {
            return res.status(400).json({
                success: false,
                message: "Corrected quotation data is required"
            });
        }

        quotation.extractedData = extractedData;

        return res.status(200).json({
            success: true,
            message: "Quotation review data updated successfully",
            data: {
                quotationId: quotation._id,
                extractedData: quotation.extractedData
            }
        });

    } catch (error) {
        console.error(
            "Quotation review update error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update quotation review data"
        });
    }
};

export const saveCorrectedQuotationData = async (req, res) => {
    try {
        const { id } = req.params;
        const { extractedData } = req.body;

        const quotation = await Quotation.findById(id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found"
            });
        }

        if (!extractedData) {
            return res.status(400).json({
                success: false,
                message: "Corrected quotation data is required"
            });
        }

        // Validate corrected data before saving
        const validation = validateQuotationExtraction(extractedData);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        quotation.extractedData = extractedData;

        const updatedQuotation = await quotation.save();

        return res.status(200).json({
            success: true,
            message: "Corrected quotation data saved successfully",
            data: {
                quotationId: updatedQuotation._id,
                extractedData: updatedQuotation.extractedData
            }
        });

    } catch (error) {
        console.error("Save corrected quotation error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save corrected quotation data"
        });
    }
};



// irm quatation
export const confirmQuotation = async (req, res) => {
    try {
        const { id } = req.params;

        const quotation = await Quotation.findById(id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found"
            });
        }

        if (!quotation.extractedData) {
            return res.status(400).json({
                success: false,
                message: "Quotation must be reviewed before confirmation"
            });
        }

        // Normalize reviewed data before confirmation
        const normalizedData = createNormalizedQuotation(
            quotation.extractedData
        );

        const validation = validateNormalizedQuotation(
            normalizedData
        );

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        quotation.confirmedData = normalizedData;
        quotation.isConfirmed = true;
        quotation.confirmedAt = new Date();

        const updatedQuotation = await quotation.save();

        return res.status(200).json({
            success: true,
            message: "Quotation confirmed successfully",
            data: {
                quotationId: updatedQuotation._id,
                confirmedData: updatedQuotation.confirmedData,
                isConfirmed: updatedQuotation.isConfirmed,
                confirmedAt: updatedQuotation.confirmedAt
            }
        });

    } catch (error) {
        console.error("Quotation confirmation error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to confirm quotation"
        });
    }
};