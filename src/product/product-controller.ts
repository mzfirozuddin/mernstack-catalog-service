import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { ProductService } from "./product-service";
import { ICreateProductRequest } from "./product-types";

export class ProductController {
    //:- NOTE: Here we do manual binding of this. To avoid this we can replace clasic function to an arrow function
    // constructor(private productServiec: ProductService) {
    //     this.create = this.create.bind(this);
    // }

    constructor(private productServiec: ProductService) {}

    //- Here we make this as arrow function. Now we don't need manual "this" binding
    create = async (
        req: ICreateProductRequest,
        res: Response,
        next: NextFunction,
    ) => {
        //: Validate the request
        const result = validationResult(req);
        // console.log("req", req.body);

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        //: Receive data from req.body
        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body;

        //: Create Product
        const product = {
            name,
            description,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unsafe-assignment
            priceConfiguration: JSON.parse(priceConfiguration as string),
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unsafe-assignment
            attributes: JSON.parse(attributes as string),
            tenantId,
            categoryId,
            isPublish,
            image: "image.jpg",
        };

        // const product
        //: TODO: Image Upload

        //: TODO: Save product to DB
        const newProduct = await this.productServiec.createProduct(product);

        //: Return response
        res.json({ id: newProduct._id });
    };
}
