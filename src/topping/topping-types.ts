import { Request } from "express";
import mongoose from "mongoose";

export interface ITopping {
    _id?: mongoose.Types.ObjectId;
    name: string;
    image?: string;
    price: number;
    tenantId: string;
}

export interface ICreateToppingRequest extends Request {
    body: ITopping;
}
