
import Vendor from "../model/Vendor.model.js";

// Create vendor
export const createVendor = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            address,
            contactPerson
        } = req.body;

        // Check required fields
        if (
            !name ||
            !email ||
            !phone ||
            !address ||
            !contactPerson
        ) {
            return res.status(400).json({
                success: false,
                message: "All vendor fields are required"
            });
        }

        // Check duplicate email
        const existingVendor = await Vendor.findOne({
            email: email.toLowerCase()
        });

        if (existingVendor) {
            return res.status(409).json({
                success: false,
                message: "Vendor with this email already exists"
            });
        }

        // Create vendor
        const vendor = await Vendor.create({
            name,
            email: email.toLowerCase(),
            phone,
            address,
            contactPerson
        });

        return res.status(201).json({
            success: true,
            message: "Vendor created successfully",
            vendor
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create vendor",
            error: error.message
        });
    }
};


// Get all vendors
export const getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            message: "Vendors fetched successfully",
            count: vendors.length,
            vendors
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch vendors",
            error: error.message
        });
    }
};

// Update vendor
export const updateVendor = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            phone,
            address,
            contactPerson
        } = req.body;

        // Find vendor
        const vendor = await Vendor.findById(id);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        }

        // Check duplicate email
        if (
            email &&
            email.toLowerCase() !== vendor.email
        ) {
            const existingVendor = await Vendor.findOne({
                email: email.toLowerCase(),
                _id: { $ne: id }
            });

            if (existingVendor) {
                return res.status(409).json({
                    success: false,
                    message: "Vendor with this email already exists"
                });
            }
        }

        // Update only provided fields
        if (name !== undefined) {
            vendor.name = name;
        }

        if (email !== undefined) {
            vendor.email = email.toLowerCase();
        }

        if (phone !== undefined) {
            vendor.phone = phone;
        }

        if (address !== undefined) {
            vendor.address = address;
        }

        if (contactPerson !== undefined) {
            vendor.contactPerson = contactPerson;
        }

        const updatedVendor = await vendor.save();

        return res.status(200).json({
            success: true,
            message: "Vendor updated successfully",
            vendor: updatedVendor
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update vendor",
            error: error.message
        });
    }
};


// Activate / Deactivate vendor
export const updateVendorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        // Validate isActive
        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be a boolean value"
            });
        }

        // Find vendor
        const vendor = await Vendor.findById(id);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        }

        // Update status
        vendor.isActive = isActive;

        const updatedVendor = await vendor.save();

        return res.status(200).json({
            success: true,
            message: isActive
                ? "Vendor activated successfully"
                : "Vendor deactivated successfully",
            vendor: updatedVendor
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update vendor status",
            error: error.message
        });
    }
};