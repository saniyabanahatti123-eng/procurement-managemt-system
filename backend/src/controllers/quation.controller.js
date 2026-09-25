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

export const submitQuotationForApproval = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);

        if (!quotation) {
            return res.status(404).json({
                message: "Quotation not found"
            });
        }

        if (!quotation.isConfirmed) {
            return res.status(400).json({
                message: "Only confirmed quotations can be submitted for approval"
            });
        }

        if (quotation.approvalStatus === "pending") {
            return res.status(400).json({
                message: "Quotation is already pending approval"
            });
        }

        if (quotation.approvalStatus === "approved") {
            return res.status(400).json({
                message: "Quotation is already approved"
            });
        }

        quotation.approvalStatus = "pending";
        quotation.rejectionReason = null;

        await quotation.save();

        return res.status(200).json({
            message: "Quotation submitted for approval",
            quotation
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to submit quotation for approval",
            error: error.message
        });
    }
};

// approval quotation
export const approveQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);

        if (!quotation) {
            return res.status(404).json({
                message: "Quotation not found"
            });
        }

        if (quotation.approvalStatus !== "pending") {
            return res.status(400).json({
                message: "Only pending quotations can be approved"
            });
        }

        quotation.approvalStatus = "approved";
        quotation.approvedBy = req.user._id;
        quotation.approvedAt = new Date();
        quotation.rejectionReason = null;

        await quotation.save();

        return res.status(200).json({
            message: "Quotation approved successfully",
            quotation
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to approve quotation",
            error: error.message
        });
    }
};

export const rejectQuotation = async (req, res) => {
    try {
        const { reason } = req.body;

        const quotation = await Quotation.findById(req.params.id);

        if (!quotation) {
            return res.status(404).json({
                message: "Quotation not found"
            });
        }

        if (quotation.approvalStatus !== "pending") {
            return res.status(400).json({
                message: "Only pending quotations can be rejected"
            });
        }

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                message: "Rejection reason is required"
            });
        }

        quotation.approvalStatus = "rejected";
        quotation.approvedBy = null;
        quotation.approvedAt = null;
        quotation.rejectionReason = reason.trim();

        await quotation.save();

        return res.status(200).json({
            message: "Quotation rejected successfully",
            quotation
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to reject quotation",
            error: error.message
        });
    }
};