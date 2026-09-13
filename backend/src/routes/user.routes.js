import express from "express";

import {
    getUsers,
    getUserById,
    updateUser
} from "../controllers/users.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import { updateUserStatus } from "../controllers/users.controller.js";

const router = express.Router();

// Get all users - Admin only
router.get(
    "/",
    authMiddleware,
    authorizeRoles("admin"),
    getUsers
);

// Get one user - Admin only
router.get(
    "/:id",
    authMiddleware,
    authorizeRoles("admin"),
    getUserById
);

//update user
router.put(
    "/users/:id",
    authMiddleware,
    authorizeRoles("admin"),
     updateUser
);

// update user status
router.patch(
    "/users/:id/status",
    authMiddleware,
    authorizeRoles("admin"),
     updateUserStatus
);

export default router;