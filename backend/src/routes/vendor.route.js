import express from "express";

import {
    createVendor,
    getVendors,
    updateVendor,
    updateVendorStatus
} from "../controllers/vendor.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

// Create vendor - Admin and Procurement
router.post(
    "/",
    authMiddleware,
    authorizeRoles("admin", "procurement"),
    createVendor
);

// Get all vendors - Admin and Procurement
router.get(
    "/",
    authMiddleware,
    authorizeRoles("admin", "procurement"),
    getVendors
);

// Update vendor
router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("admin", "procurement"),
    updateVendor
);

// Activate / Deactivate vendor
router.patch(
    "/:id/status",
    authMiddleware,
    authorizeRoles("admin", "procurement"),
    updateVendorStatus
);
export default router;