import mongoose from "mongoose";

const procurementRequestSchema = new mongoose.Schema(
    {
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Requester is required"]
        },

        title: {
            type: String,
            required: [true, "Request title is required"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters"],
            maxlength: [200, "Title cannot exceed 200 characters"]
        },

        description: {
            type: String,
            required: [true, "Request description is required"],
            trim: true,
            maxlength: [1000, "Description cannot exceed 1000 characters"]
        },

        status: {
            type: String,
            enum: {
                values: [
                    "draft",
                    "submitted",
                    "under_review",
                    "approved",
                    "rejected",
                    "cancelled"
                ],
                message: "Invalid request status"
            },
            default: "draft"
        },

        priority: {
            type: String,
            enum: {
                values: [
                    "low",
                    "medium",
                    "high",
                    "urgent"
                ],
                message: "Invalid priority"
            },
            default: "medium"
        },

        requiredBy: {
            type: Date,
            required: [true, "Required-by date is required"]
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const ProcurementRequest = mongoose.model(
    "ProcurementRequest",
    procurementRequestSchema
);

export default ProcurementRequest;