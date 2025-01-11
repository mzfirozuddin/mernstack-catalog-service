import mongoose from "mongoose";

//: Type of Category Object
interface IPriceConfiguration {
    [key: string]: {
        priceType: "base" | "additional";
        availableOptions: string[];
    };
}

interface IAttribute {
    name: string;
    widgetType: "switch" | "radio";
    defaultValue: string;
    availableOptions: string[];
}

export interface ICategory {
    name: string;
    priceConfiguration: IPriceConfiguration;
    attributes: IAttribute[];
}

//: Category Model
const priceConfigurationSchema = new mongoose.Schema<IPriceConfiguration>({
    priceType: {
        type: String,
        enum: ["base", "additional"],
        required: true,
    },
    availableOptions: {
        type: [String],
        required: true,
    },
});

const attributeSchema = new mongoose.Schema<IAttribute>({
    name: {
        type: String,
        required: true,
    },
    widgetType: {
        type: String,
        enum: ["switch", "radio"],
        required: true,
    },
    defaultValue: {
        type: mongoose.Schema.Types.Mixed, //- Now type can be String, Number,...
        required: true,
    },
    availableOptions: {
        type: [String],
        required: true,
    },
});

const categorySchema = new mongoose.Schema<ICategory>(
    {
        name: {
            type: String,
            required: true,
        },
        priceConfiguration: {
            type: Map,
            of: priceConfigurationSchema,
            required: true,
        },
        // priceConfiguration: {
        //     size: {},
        //     crust: {}
        // }
        attributes: {
            type: [attributeSchema],
            required: true,
        },
        // attributes: [
        //     {},
        //     {}
        // ]
    },
    { timestamps: true },
);

// export const Category = mongoose.model<ICategory>("Category", categorySchema);
export default mongoose.model<ICategory>("Category", categorySchema);
