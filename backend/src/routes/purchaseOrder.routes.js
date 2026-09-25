import express from "express";
import {
    createPurchaseOrder
} from "../controllers/purchaseOrder.controller.js";

const router = express.Router();

router.post(
    "/",
    createPurchaseOrder
);

export default router;