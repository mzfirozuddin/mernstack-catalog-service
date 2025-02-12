import { Request } from "express";
import mongoose from "mongoose";

export interface ITopping {
    _id?: mongoose.Types.ObjectId;
    name: string;
    image?: string;
    price: number;
    tenantId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateToppingRequest extends Request {
    body: ITopping;
}
