import ProductModel from "./product-model";
import { IFilter, IProduct } from "./product-types";

export class ProductService {
    async createProduct(product: IProduct) {
        return await ProductModel.create(product);
    }

    async getProduct(productId: string): Promise<IProduct | null> {
        return await ProductModel.findById(productId);
    }

    async updateProduct(productId: string, product: IProduct) {
        return await ProductModel.findOneAndUpdate(
            { _id: productId },
            { $set: product },
            { new: true },
        );
    }

    async getProducts(q: string, filters: IFilter) {
        const searchQueryRegexp = new RegExp(q, "i"); //: RegExp build-in class in javascript, "i" -> for case insensitive search

        //: Prepare final search filter
        const matchQuery = {
            ...filters,
            name: searchQueryRegexp,
        };

        const aggregate = ProductModel.aggregate([
            {
                $match: matchQuery,
            },
            {
                $lookup: {
                    from: "categories", //: Relation with which collection
                    localField: "categoryId", //: current collection field that made connection b/w 2 collections
                    foreignField: "_id", //: From collection's key
                    as: "category", //: Shown
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                attributes: 1,
                                priceConfiguration: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$category",
            },
        ]);

        const result = await aggregate.exec();
        return result as IProduct[];
    }
}
