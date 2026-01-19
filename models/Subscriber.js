import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email",
            ],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

export default Subscriber;
