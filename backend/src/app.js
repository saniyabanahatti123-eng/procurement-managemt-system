import express from "express";
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import vendorRoutes from "./routes/vendor.route.js"
import procurementRequestRoutes from "./routes/procurementRequest.routes.js" 
import requestItemRoutes from "./routes/requestItem.routes.js";
import authMiddleware from "./middleware/auth.middleware.js";
import authorizaRoles from "./middleware/role.middleware.js";
import purchaseOrderRoutes from "./routes/purchaseOrder.routes.js"
const app = express();


//middleaware
app.use(express.json());

// user registration
app.use("/api/v1/auth", authRoutes)

// user route
app.use("/api/v1/user" , userRoutes)

// vendor route
app.use("/api/v1/vendors", vendorRoutes);

// procurementRequest route
app.use(
    "/api/v1/procurement-requests",
    procurementRequestRoutes
);

// requestItem route
app.use(
    "/api/v1/procurement-requests",
    requestItemRoutes
);

//basic route
app.get("/", (req,res)=> {
    res.json({
        success: true,
        message: "procurcement management system API is running"
    });
});

app.use(
    "/api/v1/purchase-orders",
    authMiddleware,
    authorizaRoles("procurement" , "admin"),
    purchaseOrderRoutes
);
export default app;