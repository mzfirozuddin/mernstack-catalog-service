import { Request } from "express-jwt";
import mongoose from "mongoose";

export interface IProduct {
    name: string;
    description: string;
    image?: string;
    priceConfiguration: string;
    attributes: string;
    tenantId: string;
    categoryId: string;
    isPublish?: boolean;
}

export interface ICreateProductRequest extends Request {
    body: IProduct;
}

export interface IFilter {
    tenantId?: string;
    categoryId?: mongoose.Types.ObjectId; //: This is used to create or manipulate ObjectId instances.
    isPublish?: boolean;
}

//-===================================================================
// interface IPriceConfiguration {
//     [key: string]: {
//         priceType: "base" | "additional";
//         availableOptions: {
//             [key: string]: number;
//         };
//     };
// }

// interface IPriceOption {
//     [key: string]: number;
// }

// interface ICustomizationCategory {
//     priceType: string;
//     availableOptions: IPriceOption;
// }

// export interface IPriceConfiguration {
//     [key: string]: ICustomizationCategory;
// }

// export interface IAttribute {
//     name: string;
//     value: string | number | boolean | object | null | undefined;
// }
