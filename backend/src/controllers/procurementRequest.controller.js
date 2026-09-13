import { request } from "express";
import ProcurementRequest from "../model/ProcurementRequest.model.js";
import User from "../model/user.model.js";


// Create procurement request
export const createProcurementRequest = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            requiredBy
        } = req.body;

        // Validate required fields
        if (!title || !description || !requiredBy) {
            return res.status(400).json({
                success: false,
                message: "Title, description and requiredBy are required"
            });
        }

        // Create request
        const procurementRequest = await ProcurementRequest.create({
            requester: req.user._id,
            title,
            description,
            priority,
            requiredBy
        });

        return res.status(201).json({
            success: true,
            message: "Procurement request created successfully",
            request: procurementRequest
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create procurement request",
            error: error.message
        });
    }
};

// Get procurement requests
export const getProcurementRequests = async (req, res) => {
    try {
        let requests;

        // Requester can only see their own requests
        if (req.user.role === "requester") {
            requests = await ProcurementRequest.find({
                requester: req.user._id
            })
                .populate("requester", "name email role")
                .sort({ createdAt: -1 });
        } else {
            // Admin and procurement can see all requests
            requests = await ProcurementRequest.find()
                .populate("requester", "name email role")
                .sort({ createdAt: -1 });
        }

        return res.status(200).json({
            success: true,
            message: "Procurement requests fetched successfully",
            count: requests.length,
            requests
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch procurement requests",
            error: error.message
        });
    }
};


// Get single procurement request
export const getProcurementRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await ProcurementRequest.findById(id)
            .populate("requester", "name email role");

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Procurement request not found"
            });
        }

        // Requester can only view their own request
        if (
            req.user.role === "requester" &&
            request.requester._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to view this request"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Procurement request fetched successfully",
            request
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch procurement request",
            error: error.message
        });
    }
};

// Update procurement request
export const updateProcurementRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            priority,
            requiredBy
        } = req.body;

        const request = await ProcurementRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Procurement request not found"
            });
        }

        // Only the requester who created the request can update it
        if (
            request.requester.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to update this request"
            });
        }

        // Only draft requests can be updated
        if (request.status !== "draft") {
            return res.status(400).json({
                success: false,
                message: "Only draft requests can be updated"
            });
        }

        // Update only provided fields
        if (title !== undefined) {
            request.title = title;
        }

        if (description !== undefined) {
            request.description = description;
        }

        if (priority !== undefined) {
            request.priority = priority;
        }

        if (requiredBy !== undefined) {
            request.requiredBy = requiredBy;
        }

        const updatedRequest = await request.save();

        return res.status(200).json({
            success: true,
            message: "Procurement request updated successfully",
            request: updatedRequest
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update procurement request",
            error: error.message
        });
    }
};


// Cancel procurement request
export const cancelProcurementRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await ProcurementRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Procurement request not found"
            });
        }

        // Only the requester who created the request can cancel it
        if (
            request.requester.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to cancel this request"
            });
        }

        // Only active requests can be cancelled
        if (!request.isActive) {
            return res.status(400).json({
                success: false,
                message: "Request is already inactive"
            });
        }

        // Cancel request
        request.status = "cancelled";
        request.isActive = false;

        const cancelledRequest = await request.save();

        return res.status(200).json({
            success: true,
            message: "Procurement request cancelled successfully",
            request: cancelledRequest
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to cancel procurement request",
            error: error.message
        });
    }
};

export const updateProcurementRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Check whether status is provided
        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        // Find procurement request
        const request = await ProcurementRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Procurement request not found"
            });
        }

        const currentStatus = request.status;

        // Define valid status transitions
        const validTransitions = {
            draft: ["submitted", "cancelled"],
            submitted: ["under_review", "cancelled"],
            under_review: ["approved", "rejected"],
            rejected: ["draft"],
            approved: [],
            cancelled: []
        };

        // Check whether requested transition is allowed
        if (!validTransitions[currentStatus].includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${currentStatus} to ${status}`
            });
        }

        // Requester-specific rules
        if (
            status === "submitted" &&
            request.requester.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Only the requester can submit this request"
            });
        }

        if (
            status === "cancelled" &&
            request.requester.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Only the requester can cancel this request"
            });
        }

        // Procurement team moves submitted request to under_review
        if (
            status === "under_review" &&
            !["procurement", "admin"].includes(req.user.role)
        ) {
            return res.status(403).json({
                success: false,
                message: "Only procurement or admin can move the request to under review"
            });
        }

        // Approver moves under_review request to approved/rejected
        if (
            ["approved", "rejected"].includes(status) &&
            !["approver", "admin"].includes(req.user.role)
        ) {
            return res.status(403).json({
                success: false,
                message: "Only approver or admin can approve or reject the request"
            });
        }

        // Rejected request can be sent back to draft by requester
        if (
            status === "draft" &&
            request.requester.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Only the requester can move the rejected request back to draft"
            });
        }

        // Cancel request
        if (status === "cancelled") {
            request.status = "cancelled";
            request.isActive = false;
        } else {
            request.status = status;
        }

        const updatedRequest = await request.save();

        return res.status(200).json({
            success: true,
            message: "Procurement request status updated successfully",
            request: updatedRequest
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update procurement request status",
            error: error.message
        });
    }
};