import ProductModel from "./product-model";
import { IProduct } from "./product-types";

export class ProductService {
    async createProduct(product: IProduct) {
        return await ProductModel.create(product);
    }
}
