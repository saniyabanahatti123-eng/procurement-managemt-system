import RequestItem from "../model/requestItem.model.js";
import ProcurementRequest from "../model/ProcurementRequest.model.js"

export const createRequestItem = async (req, res) => {
    try {
        const { requestId } = req.params;

        const {
            itemName,
            description,
            quantity,
            unit,
            specifications
        } = req.body;

        // Check required fields
        if (!itemName || quantity === undefined || !unit) {
            return res.status(400).json({
                success: false,
                message: "Item name, quantity and unit are required"
            });
        }

        // Find procurement request
        const request = await ProcurementRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Procurement request not found"
            });
        }

        // Only requester who owns the request can add items
        if (
            request.requester.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to add items to this request"
            });
        }

        // Items can only be added while request is draft
        if (request.status !== "draft") {
            return res.status(400).json({
                success: false,
                message: "Items can only be added to a draft request"
            });
        }

        const requestItem = await RequestItem.create({
            request: requestId,
            itemName,
            description,
            quantity,
            unit,
            specifications
        });

        return res.status(201).json({
            success: true,
            message: "Request item created successfully",
            item: requestItem
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create request item",
            error: error.message
        });
    }
};

export const updateRequestItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        const {
            itemName,
            description,
            quantity,
            unit,
            specifications
        } = req.body;

        const requestItem = await RequestItem.findById(itemId);

        if (!requestItem) {
            return res.status(404).json({
                success: false,
                message: "Request item not found"
            });
        }

        const request = await ProcurementRequest.findById(
            requestItem.request
        );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Procurement request not found"
            });
        }

        // Only owner can update
        if (
            request.requester.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to update this item"
            });
        }

        // Only draft requests can be modified
        if (request.status !== "draft") {
            return res.status(400).json({
                success: false,
                message: "Items can only be updated while the request is in draft"
            });
        }

        if (itemName !== undefined) {
            requestItem.itemName = itemName;
        }

        if (description !== undefined) {
            requestItem.description = description;
        }

        if (quantity !== undefined) {
            requestItem.quantity = quantity;
        }

        if (unit !== undefined) {
            requestItem.unit = unit;
        }

        if (specifications !== undefined) {
            requestItem.specifications = specifications;
        }

        const updatedItem = await requestItem.save();

        return res.status(200).json({
            success: true,
            message: "Request item updated successfully",
            item: updatedItem
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update request item",
            error: error.message
        });
    }
};











