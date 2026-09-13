import express from "express";

import {
    createProcurementRequest,
    getProcurementRequestById,
    getProcurementRequests,
    updateProcurementRequest,
    cancelProcurementRequest,
    updateProcurementRequestStatus
} from "../controllers/procurementRequest.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();


// Create procurement request
router.post(
    "/",
    authMiddleware,
    authorizeRoles("requester"),
    createProcurementRequest
);

// Get procurement requests
router.get(
    "/",
    authMiddleware,
    authorizeRoles("requester", "procurement", "admin"),
    getProcurementRequests
);


// Get single procurement request
router.get(
    "/:id",
    authMiddleware,
    authorizeRoles("requester", "procurement", "admin"),
    getProcurementRequestById
);

// Update procurement request
router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("requester"),
    updateProcurementRequest
);


// Cancel procurement request
router.patch(
    "/:id/cancel",
    authMiddleware,
    authorizeRoles("requester"),
    cancelProcurementRequest
);
 
// procurementstatus route
router.patch(
    "/:id/status",
    authMiddleware,
    authorizeRoles(
        "requester",
        "procurement",
        "approver",
        "admin"
    ),
    updateProcurementRequestStatus
);
export default router;