import mongoose from "mongoose";

export interface ITopping {
    _id?: mongoose.Types.ObjectId;
    name: string;
    image: string;
    price: number;
    tenantId: string;
}

export interface ICreateRequestBody {
    name: string;
    price: number;
    tenantId: string;
}
