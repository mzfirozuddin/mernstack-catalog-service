import CategoryModel from "./category-model";
import { ICategory } from "./category-types";

export class CategoryServices {
    async create(category: ICategory) {
        const newCategory = new CategoryModel(category);
        return newCategory.save();
    }

    async update(categoryId: string, category: ICategory) {
        return await CategoryModel.findByIdAndUpdate(
            categoryId,
            { $set: category },
            { new: true },
        );
    }

    async getOne(categoryId: string) {
        return await CategoryModel.findById(categoryId);
    }

    async getAll() {
        return await CategoryModel.find();
    }

    async delete(categoryId: string) {
        return await CategoryModel.findByIdAndDelete(categoryId);
    }
}
