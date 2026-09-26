import express from "express"
import authMiddleware from "../middleware/auth.middleware.js";
import authorizaRoles from "../middleware/role.middleware.js"
import {
    createPurchaseOrder,
    getAllPurchaseOrders,
    getPurchaseOrderById,
    updatePurchaseOrderStatus,
    updateProcurementTracking,
    getProcurementTracking
} from "../controllers/purchaseOrder.controller.js";


const router = express.Router();

router.post(
    "/",
    createPurchaseOrder
);

router.get(
    "/",
    authMiddleware,
    getAllPurchaseOrders
);

router.get(
    "/",
    authMiddleware,
    getPurchaseOrderById
)

router.patch(
    "/:id/status",
    authMiddleware,
  authorizaRoles("procurement", "admin"),
    updatePurchaseOrderStatus
);

router.patch(
    "/:id/tracking",
    authMiddleware,
    authorizaRoles("procurement", "admin"),
    updateProcurementTracking
);
router.get(
    "/:id/tracking",
    authMiddleware,
    authorizaRoles("requester", "procurement", "approver", "admin"),
    getProcurementTracking
);
export default router;