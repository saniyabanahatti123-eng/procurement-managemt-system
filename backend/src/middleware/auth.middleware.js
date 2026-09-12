import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

const authMiddleware = async (req, res, next) => {
    try {
        // Get authorization header
        const authHeader = req.headers.authorization;

        // Check whether token exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is required"
            });
        }

        // Extract token from "Bearer <token>"
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find user in database
        const user = await User.findById(decoded.userId)
            .select("-password");

        // Check whether user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Check whether user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "User account is inactive"
            });
        }

        // Store authenticated user information in req
        req.user = user;

        // Continue to next middleware/controller
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token"
        });
    }
};

export default authMiddleware;