import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema(
    {
        request: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProcurementRequest",
            required: [true, "Procurement request is required"]
        },

        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: [true, "Vendor is required"]
        },

        quotationNumber: {
            type: String,
            required: [true, "Quotation number is required"],
            trim: true,
            maxlength: [
                100,
                "Quotation number cannot exceed 100 characters"
            ]
        },

        quotationDate: {
            type: Date,
            required: [true, "Quotation date is required"]
        },

        validUntil: {
            type: Date,
            required: [true, "Quotation validity date is required"]
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
                message: "Invalid quotation status"
            },
            default: "draft"
        },

        isActive: {
            type: Boolean,
            default: true
        },

        // documents
        document: {
    fileName: {
        type: String,
        trim: true
    },

    originalName: {
        type: String,
        trim: true
    },

    filePath: {
        type: String,
        trim: true
    },

    mimeType: {
        type: String,
        trim: true
    },

    fileSize: {
        type: Number
    },

    // extracted data
    extractedData: {
    quotationNumber: {
        type: String,
        trim: true
    },

    quotationDate: {
        type: Date
    },

    validUntil: {
        type: Date
    },

    vendor: {
        name: {
            type: String,
            trim: true
        },

        email: {
            type: String,
            trim: true
        },

        phone: {
            type: String,
            trim: true
        }
    },

    items: [
        {
            itemName: {
                type: String,
                trim: true
            },

            description: {
                type: String,
                trim: true
            },

            quantity: {
                type: Number,
                min: 0
            },

            unit: {
                type: String,
                trim: true
            },

            unitPrice: {
                type: Number,
                min: 0
            },

            tax: {
                type: Number,
                min: 0
            },

            discount: {
                type: Number,
                min: 0
            },

            subtotal: {
                type: Number,
                min: 0
            },

            total: {
                type: Number,
                min: 0
            }
        }
    ],

    grandTotal: {
        type: Number,
        min: 0
    },

    currency: {
        type: String,
        trim: true
    },
    
    confirmedData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
},

isConfirmed: {
    type: Boolean,
    default: false
},

confirmedAt: {
    type: Date,
    default: null
}
}
}
    },
    
    {
        timestamps: true
    }
);

const Quotation = mongoose.model(
    "Quotation",
    quotationSchema
);

export default Quotation;