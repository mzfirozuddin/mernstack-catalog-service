import ProductModel from "./product-model";
import { IProduct } from "./product-types";

export class ProductService {
    async createProduct(product: IProduct) {
        return await ProductModel.create(product);
    }

    async getProductImage(productId: string) {
        const product = await ProductModel.findById(productId);
        return product?.image;
    }

    async updateProduct(productId: string, product: IProduct) {
        return await ProductModel.findOneAndUpdate(
            { _id: productId },
            { $set: product },
            { new: true },
        );
    }
}
