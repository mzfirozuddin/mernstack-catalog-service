import mongoose from "mongoose";

const priceConfigurationSchema = new mongoose.Schema(
    {
        priceType: {
            type: String,
            enum: ["base", "additional"],
        },
        availableOptions: {
            type: Map, //: Map means key:value pare
            of: Number,
        },

        //Eg:-
        // availableOptions: {
        //     "small": 400,  //: Here small is string and 400 is number
        //     "medium": 600
        // },
    },
    { _id: false },
);

const attributeValueSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
    { _id: false },
);

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            reqired: true,
        },
        description: {
            type: String,
            reqired: true,
        },
        image: {
            type: String, //: S3 URL
            reqired: true,
        },
        priceConfiguration: {
            type: Map,
            of: priceConfigurationSchema,
        },
        attributes: [attributeValueSchema],
        tenantId: {
            type: String,
            reqired: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        isPublish: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

export default mongoose.model("Product", productSchema);
