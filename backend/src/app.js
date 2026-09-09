import express from "express";
const app = express();

//middleaware
app.use(express.json());
//basic route
app.get("/", (req,res)=> {
    res.json({
        success: true,
        message: "procurcement management system API is running"
    });
});

export default app;