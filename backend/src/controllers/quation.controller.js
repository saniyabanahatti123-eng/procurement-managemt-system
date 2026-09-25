import Quotation from "../model/Quotation.model.js";
import ProcurementRequest from "../model/ProcurementRequest.model.js";
import Vendor from "../model/vendor.model.js";

export const createQuotation = async (req, res) => {
    try {
        const {
            request,
            vendor,
            quotationNumber,
            quotationDate,
            validUntil
        } = req.body;

        // Check required fields
        if (
            !request ||
            !vendor ||
            !quotationNumber ||
            !quotationDate ||
            !validUntil
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Request, vendor, quotationNumber, quotationDate and validUntil are required"
            });
        }

        // Check procurement request
        const procurementRequest =
            await ProcurementRequest.findById(request);

        if (!procurementRequest) {
            return res.status(404).json({
                success: false,
                message: "Procurement request not found"
            });
        }

        // Check vendor
        const existingVendor = await Vendor.findById(vendor);

        if (!existingVendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        }

        // Vendor must be active
        if (!existingVendor.isActive) {
            return res.status(400).json({
                success: false,
                message: "Vendor is inactive"
            });
        }

        // Create quotation
        const quotation = await Quotation.create({
            request,
            vendor,
            quotationNumber,
            quotationDate,
            validUntil
        });

        return res.status(201).json({
            success: true,
            message: "Quotation created successfully",
            quotation
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create quotation",
            error: error.message
        });
    }
};

//QUAOTATION UPLOAD
export const uploadQuotationDocument = async (req, res) => {
    try {
        const { id } = req.params;

        // Check quotation
        const quotation = await Quotation.findById(id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found"
            });
        }

        // Check file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Quotation document is required"
            });
        }

        // Save document information
        quotation.document = {
            fileName: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            mimeType: req.file.mimetype,
            fileSize: req.file.size
        };

        const updatedQuotation = await quotation.save();

        return res.status(200).json({
            success: true,
            message: "Quotation document uploaded successfully",
            quotation: updatedQuotation
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to upload quotation document",
            error: error.message
        });
    }
};