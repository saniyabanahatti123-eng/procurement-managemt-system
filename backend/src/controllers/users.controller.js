import User from "../model/User.model.js";

// Get all users - Admin only
export const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            count: users.length,
            users
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message
        });
    }
};


// Get single user by ID - Admin only
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user",
            error: error.message
        });
    }
};

// update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        // Find user
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Validate role if provided
        const allowedRoles = [
            "requester",
            "procurement",
            "approver",
            "admin"
        ];

        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        // Check duplicate email
        if (email && email.toLowerCase() !== user.email) {
            const existingUser = await User.findOne({
                email: email.toLowerCase()
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists"
                });
            }
        }

        // Update only provided fields
        if (name !== undefined) {
            user.name = name;
        }

        if (email !== undefined) {
            user.email = email.toLowerCase();
        }

        if (role !== undefined) {
            user.role = role;
        }

        const updatedUser = await user.save();

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isActive: updatedUser.isActive
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: error.message
        });
    }
};

export const updateUserStatus = async (req, res) => {
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

        // Find user
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update account status
        user.isActive = isActive;

        const updatedUser = await user.save();

        return res.status(200).json({
            success: true,
            message: isActive
                ? "User activated successfully"
                : "User deactivated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isActive: updatedUser.isActive
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update user status",
            error: error.message
        });
    }
};