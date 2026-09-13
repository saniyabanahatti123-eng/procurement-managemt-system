import mongoose from "mongoose";

const requestItemSchema = new mongoose.Schema(
    {
        request: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProcurementRequest",
            required: [true, "Procurement request is required"]
        },

        itemName: {
            type: String,
            required: [true, "Item name is required"],
            trim: true,
            minlength: [2, "Item name must be at least 2 characters"],
            maxlength: [150, "Item name cannot exceed 150 characters"]
        },

        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"]
        },

        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"]
        },

        unit: {
            type: String,
            required: [true, "Unit is required"],
            trim: true,
            minlength: [1, "Unit is required"],
            maxlength: [50, "Unit cannot exceed 50 characters"]
        },

        specifications: {
            type: String,
            trim: true,
            maxlength: [1000, "Specifications cannot exceed 1000 characters"]
        }
    },
    {
        timestamps: true
    }
);

const RequestItem = mongoose.model(
    "RequestItem",
    requestItemSchema
);

export default RequestItem;