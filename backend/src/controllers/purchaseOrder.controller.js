export const createPurchaseOrder = async (req, res) => {
    try {
        const {
            quotationId,
            deliveryAddress,
            expectedDeliveryDate
        } = req.body;

        if (!quotationId) {
            return res.status(400).json({
                message: "Quotation ID is required"
            });
        }

        if (!deliveryAddress || !deliveryAddress.trim()) {
            return res.status(400).json({
                message: "Delivery address is required"
            });
        }

        if (
            expectedDeliveryDate &&
            isNaN(new Date(expectedDeliveryDate).getTime())
        ) {
            return res.status(400).json({
                message: "Invalid expected delivery date"
            });
        }

        const quotation = await Quotation.findById(quotationId);

        if (!quotation) {
            return res.status(404).json({
                message: "Quotation not found"
            });
        }

        if (quotation.approvalStatus !== "approved") {
            return res.status(400).json({
                message:
                    "Only approved quotations can create a purchase order"
            });
        }

        if (!quotation.confirmedData) {
            return res.status(400).json({
                message: "Confirmed quotation data is required"
            });
        }

        const existingPO = await PurchaseOrder.findOne({
            quotation: quotation._id
        });

        if (existingPO) {
            return res.status(400).json({
                message:
                    "Purchase order already exists for this quotation"
            });
        }

        const confirmedData = quotation.confirmedData;
        const items = confirmedData.items || [];

        if (!items.length) {
            return res.status(400).json({
                message:
                    "Quotation must contain at least one item"
            });
        }

        for (const item of items) {
            if (!item.itemName) {
                return res.status(400).json({
                    message: "Item name is required"
                });
            }

            if (!item.quantity || Number(item.quantity) <= 0) {
                return res.status(400).json({
                    message:
                        `Invalid quantity for ${item.itemName}`
                });
            }

            if (!item.unit) {
                return res.status(400).json({
                    message:
                        `Unit is required for ${item.itemName}`
                });
            }

            if (
                item.unitPrice === undefined ||
                Number(item.unitPrice) < 0
            ) {
                return res.status(400).json({
                    message:
                        `Invalid unit price for ${item.itemName}`
                });
            }

            if (
                item.total === undefined ||
                Number(item.total) < 0
            ) {
                return res.status(400).json({
                    message:
                        `Invalid total for ${item.itemName}`
                });
            }
        }

        const totalAmount = items.reduce((sum, item) => {
            return sum + Number(item.total || 0);
        }, 0);

        const poNumber = `PO-${Date.now()}`;

        const purchaseOrder = await PurchaseOrder.create({
            poNumber,
            procurementRequest: quotation.procurementRequest,
            quotation: quotation._id,
            vendor: quotation.vendor,
            items,
            totalAmount,
            deliveryAddress: deliveryAddress.trim(),
            expectedDeliveryDate: expectedDeliveryDate || null,
            status: "draft",
            createdBy: req.user._id
        });

        return res.status(201).json({
            message: "Purchase order created successfully",
            purchaseOrder
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to create purchase order",
            error: error.message
        });
    }
};

export const getAllPurchaseOrders = async (req, res) => {
    try {
        const purchaseOrders = await PurchaseOrder.find()
            .populate("procurementRequest")
            .populate("quotation")
            .populate("vendor")
            .populate("createdBy", "name email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: purchaseOrders.length,
            purchaseOrders
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch purchase orders",
            error: error.message
        });
    }
};

export const getPurchaseOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const purchaseOrder = await PurchaseOrder.findById(id)
            .populate("procurementRequest")
            .populate("quotation")
            .populate("vendor")
            .populate("createdBy", "name email role");

        if (!purchaseOrder) {
            return res.status(404).json({
                message: "Purchase order not found"
            });
        }

        return res.status(200).json({
            purchaseOrder
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch purchase order",
            error: error.message
        });
    }
};

export const updatePurchaseOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["issued", "cancelled"].includes(status)) {
            return res.status(400).json({
                message: "Invalid purchase order status"
            });
        }

        const purchaseOrder = await PurchaseOrder.findById(id);

        if (!purchaseOrder) {
            return res.status(404).json({
                message: "Purchase order not found"
            });
        }

        if (purchaseOrder.status === "cancelled") {
            return res.status(400).json({
                message:
                    "Cancelled purchase order cannot be updated"
            });
        }

        if (
            purchaseOrder.status === "issued" &&
            status === "issued"
        ) {
            return res.status(400).json({
                message: "Purchase order is already issued"
            });
        }

        purchaseOrder.status = status;

        await purchaseOrder.save();

        return res.status(200).json({
            message: `Purchase order ${status} successfully`,
            purchaseOrder
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update purchase order status",
            error: error.message
        });
    }
};

export const updateProcurementTracking = async (req, res) => {
    try {
        const { id } = req.params;
        const { trackingStatus, actualDeliveryDate } = req.body;

        const allowedStatuses = [
            "pending",
            "ordered",
            "shipped",
            "delivered"
        ];

        if (!allowedStatuses.includes(trackingStatus)) {
            return res.status(400).json({
                message: "Invalid tracking status"
            });
        }

        const purchaseOrder = await PurchaseOrder.findById(id);

        if (!purchaseOrder) {
            return res.status(404).json({
                message: "Purchase order not found"
            });
        }

        if (purchaseOrder.status === "cancelled") {
            return res.status(400).json({
                message:
                    "Cancelled purchase order cannot be tracked"
            });
        }

        const statusOrder = {
            pending: 0,
            ordered: 1,
            shipped: 2,
            delivered: 3
        };

        if (
            statusOrder[trackingStatus] <
            statusOrder[purchaseOrder.trackingStatus]
        ) {
            return res.status(400).json({
                message:
                    "Tracking status cannot move backwards"
            });
        }

        if (
            actualDeliveryDate &&
            isNaN(new Date(actualDeliveryDate).getTime())
        ) {
            return res.status(400).json({
                message: "Invalid actual delivery date"
            });
        }

        purchaseOrder.trackingStatus = trackingStatus;
        purchaseOrder.trackingUpdatedAt = new Date();

        if (trackingStatus === "delivered") {
            purchaseOrder.actualDeliveryDate =
                actualDeliveryDate
                    ? new Date(actualDeliveryDate)
                    : new Date();
        }

        await purchaseOrder.save();

        return res.status(200).json({
            message: "Procurement tracking updated successfully",
            purchaseOrder
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update procurement tracking",
            error: error.message
        });
    }
};

export const getProcurementTracking = async (req, res) => {
    try {
        const { id } = req.params;

        const purchaseOrder = await PurchaseOrder.findById(id)
            .select(
                "poNumber status trackingStatus trackingUpdatedAt expectedDeliveryDate actualDeliveryDate vendor"
            )
            .populate("vendor");

        if (!purchaseOrder) {
            return res.status(404).json({
                message: "Purchase order not found"
            });
        }

        return res.status(200).json({
            tracking: {
                poNumber: purchaseOrder.poNumber,
                status: purchaseOrder.status,
                trackingStatus: purchaseOrder.trackingStatus,
                trackingUpdatedAt: purchaseOrder.trackingUpdatedAt,
                expectedDeliveryDate:
                    purchaseOrder.expectedDeliveryDate,
                actualDeliveryDate:
                    purchaseOrder.actualDeliveryDate,
                vendor: purchaseOrder.vendor
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch procurement tracking",
            error: error.message
        });
    }
};