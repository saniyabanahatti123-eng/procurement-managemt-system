import express from "express";

import {
    createQuotation,
    uploadQuotationDocument,
    submitQuotationForApproval,
    approveQuotation,
    rejectQuotation
} from "../controllers/quation.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import { extractQuotationWithAIController } from "../controllers/aiQuotation.controller.js";
import { getQuotationForReview,updateQuotationReviewData,saveCorrectedQuotationData ,confirmQuotation} 
from "../controllers/quotationReview.controller.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorizeRoles("procurement", "admin"),
    createQuotation
);

router.post(
    "/:id/document",
    authMiddleware,
    authorizeRoles("procurement", "admin"),
    upload.single("document"),
    uploadQuotationDocument
);
 // extract data from  pd
router.get(
    "/:id/document/text",
    authMiddleware,
    authorizeRoles("procurement", "admin"),
    extractQuotationPdfText
);

// extract data from excel
router.get(
    "/:id/document/excel",
    authMiddleware,
    authorizeRoles("procurement", "admin"),
    extractQuotationExcelData
);

// ai-extraction
router.post(
    "/:id/ai-extract",
    authMiddleware,
    authorizeRoles("procurement", "admin"),
    extractQuotationWithAIController
)

//quotation - review
router.get(
    "/:id/review",
    authMiddleware,
    authorizeRoles("procurement", "admin", "approver"),
    getQuotationForReview
);
 
//update review quotation data
router.patch(
    "/:id/review",
    authMiddleware,
    authorizeRoles("procurement", "admin"),
    updateQuotationReviewData
);

router.patch(
    "/:id/review/save",
    authMiddleware,
    authorizeRoles("procurement", "admin"),
    saveCorrectedQuotationData
);


router.patch(
    "/:id/confirm",
    authMiddleware,
    authorizeRoles("procurement", "admin"),
    confirmQuotation
);

// submit approval
router.patch(
    "/:id/submit-approval",
    authMiddleware,
    authorizeRoles("procurement", "admin"),
    submitQuotationForApproval
);

// approval
router.patch(
    "/:id/approve",
    authMiddleware,
    authorizeRoles("admin", "approver"),
    approveQuotation
);

//rejected
router.patch(
    "/:id/reject",
    authMiddleware,
    authorizeRoles("admin", "approver"),
    rejectQuotation
);
export default router;