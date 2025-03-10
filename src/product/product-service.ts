import { paginationLabels } from "../config/pagination";
import ProductModel from "./product-model";
import { IFilter, IPaginateQuery, IProduct } from "./product-types";

export class ProductService {
    async createProduct(product: IProduct) {
        return (await ProductModel.create(product)) as IProduct;
    }

    async getProduct(productId: string): Promise<IProduct | null> {
        return await ProductModel.findById(productId).populate("categoryId"); //: 1st parameter should be foreign key
    }

    async updateProduct(productId: string, product: IProduct) {
        return (await ProductModel.findOneAndUpdate(
            { _id: productId },
            { $set: product },
            { new: true },
        )) as IProduct;
    }

    async getProducts(
        q: string,
        filters: IFilter,
        paginateQuery: IPaginateQuery,
    ) {
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

        // const result = await aggregate.exec();
        // return result as IProduct[];

        //: After added pagination
        return ProductModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });
    }

    async deleteProduct(productId: string) {
        return await ProductModel.findByIdAndDelete(productId);
    }
}
