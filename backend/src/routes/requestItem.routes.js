import express from "express";

import {
    createRequestItem,
    updateRequestItem
} from "../controllers/requestItem.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
    "/:requestId/items",
    authMiddleware,
    authorizeRoles("requester"),
    createRequestItem
);

router.put(
    "/items/:itemId",
    authMiddleware,
    authorizeRoles("requester"),
    updateRequestItem
);

export default router;