import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { ICategory } from "./category-types";
import { CategoryServices } from "./category-services";
import { Logger } from "winston";

export class CategoryController {
    constructor(
        private categoryService: CategoryServices,
        private logger: Logger,
    ) {
        this.create = this.create.bind(this); //: Manually bind "this" for create method
        this.update = this.update.bind(this);
        this.getOne = this.getOne.bind(this);
        this.getAll = this.getAll.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(req: Request, res: Response, next: NextFunction) {
        //: Validate the request
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        //: get data from req.body
        const { name, priceConfiguration, attributes } = req.body as ICategory;

        //: call the service to save data to DB
        // console.log("categoryService", this); //: Undefined (Before "this" binding)
        const category = await this.categoryService.create({
            name,
            priceConfiguration,
            attributes,
        });

        this.logger.info(`Created category`, { id: category._id });

        res.status(201).json({ id: category._id });
    }

    async update(req: Request, res: Response, next: NextFunction) {
        //: validate the request
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        //: get id from req.params
        const categoryId = req.params.id;

        //: Check category present or not
        const existingCaegory = await this.categoryService.getOne(categoryId);
        // console.log("existingCaegory", existingCaegory);

        if (!existingCaegory) {
            return next(createHttpError(404, "Category not found"));
        }

        //: get data from req.body
        const { name, priceConfiguration, attributes } = req.body as ICategory;

        //: call the service to update data to DB
        const updatedCategory = await this.categoryService.update(categoryId, {
            name,
            priceConfiguration,
            attributes,
        });

        this.logger.info(`Created updated`, { id: updatedCategory?._id });

        res.status(200).json({ id: updatedCategory?._id });
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const categoryId = req.params.id;
        // console.log(categoryId);
        const category = await this.categoryService.getOne(categoryId);
        // console.log(category);
        if (!category) {
            return next(createHttpError(404, "Category not found"));
        }

        this.logger.info(`Getting category`, { id: category._id });

        res.status(200).json(category);
    }

    async getAll(req: Request, res: Response) {
        const categories = await this.categoryService.getAll();

        this.logger.info(`Getting all category`);

        res.status(200).json(categories);
    }

    async delete(req: Request, res: Response) {
        const categoryId = req.params.id;
        const category = await this.categoryService.delete(categoryId);
        this.logger.info(`Category deleted`, { id: category?._id });

        res.json({ id: category?._id });
    }
}
