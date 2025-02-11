import mongoose from "mongoose";
import { ITopping } from "./topping-types";

const toppingSchema = new mongoose.Schema<ITopping>(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        tenantId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

export default mongoose.model("Topping", toppingSchema);
