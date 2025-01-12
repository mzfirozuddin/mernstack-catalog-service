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
}
