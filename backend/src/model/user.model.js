import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
    name: {
        type:String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },

    email: {
        type:String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },

    password: {
        type:String,
        required: true,
        minlength: 6
    },

    role: {
        type:String,
        required: true,
        enum: ["requester", "procurement", "approver", "admin"],
    },

    isactive: {
        type: Boolean,
        default: true,
    }
    
}, 
{
    timestamps:true
}
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;