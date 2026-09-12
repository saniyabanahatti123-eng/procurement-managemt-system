import express from "express";
import authRoutes from "./routes/auth.routes.js"
const app = express();


//middleaware
app.use(express.json());

// user registration
app.use("api/v1/auth", authRoutes)
//basic route
app.get("/", (req,res)=> {
    res.json({
        success: true,
        message: "procurcement management system API is running"
    });
});

export default app;