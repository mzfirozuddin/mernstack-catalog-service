import { Request } from "express-jwt";

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
