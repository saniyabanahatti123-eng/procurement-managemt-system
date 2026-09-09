import mongoose from "mongoose"
import dotenv from "dotenv";
dotenv.config();




const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        console.log("mongoose connected successfully !!!")
    } catch (error) {
        console.error("mongose failed to connect:" , error.message);
        process.exit(1);
        
    }
};

export default connectDB