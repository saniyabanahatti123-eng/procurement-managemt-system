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