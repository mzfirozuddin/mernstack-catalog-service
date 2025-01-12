import categoryModel from "./category-model";
import { ICategory } from "./category-types";

export class CategoryServices {
    async create(category: ICategory) {
        const newCategory = new categoryModel(category);
        return newCategory.save();
    }
}
