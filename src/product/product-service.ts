import ProductModel from "./product-model";
import { IProduct } from "./product-types";

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
}
