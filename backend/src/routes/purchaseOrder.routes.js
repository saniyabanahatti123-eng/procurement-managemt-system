import express from "express"
import authorizaRoles from "../middleware/role.middleware.js";
import {
    createPurchaseOrder,
    getAllPurchaseOrders,
    getPurchaseOrderById,
    updatePurchaseOrderStatus
} from "../controllers/purchaseOrder.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

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
export default router;