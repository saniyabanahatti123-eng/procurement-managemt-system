import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
    {
        poNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        procurementRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProcurementRequest",
            required: true
        },

        quotation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quotation",
            required: true
        },

        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true
        },

        items: [
            {
                itemName: {
                    type: String,
                    required: true,
                    trim: true
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                unit: {
                    type: String,
                    required: true,
                    trim: true
                },

                unitPrice: {
                    type: Number,
                    required: true,
                    min: 0
                },

                tax: {
                    type: Number,
                    default: 0,
                    min: 0
                },

                discount: {
                    type: Number,
                    default: 0,
                    min: 0
                },

                total: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        deliveryAddress: {
            type: String,
            required: true,
            trim: true
        },

        expectedDeliveryDate: {
            type: Date,
            default: null
        },

        status: {
            type: String,
            enum: ["draft", "issued", "cancelled"],
            default: "draft"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const PurchaseOrder = mongoose.model(
    "PurchaseOrder",
    purchaseOrderSchema
);

export default PurchaseOrder;