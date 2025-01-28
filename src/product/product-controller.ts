import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { ProductService } from "./product-service";
import { ICreateProductRequest } from "./product-types";
import { IFileStorage } from "../common/types/storage";

export class ProductController {
    //:- NOTE: Here we do manual binding of this. To avoid this we can replace clasic function to an arrow function
    // constructor(private productServiec: ProductService) {
    //     this.create = this.create.bind(this);
    // }

    constructor(
        private productServiec: ProductService,
        private storage: IFileStorage,
    ) {}

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

        //: Get image from req.files
        const image = req.files!.image as UploadedFile;

        //: Image Upload
        const imageName = uuidv4(); //: Generate unique id each time

        await this.storage.upload({
            fileName: imageName,
            fileData: image.data.buffer,
        });

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
            image: imageName,
        };

        //: Save product to DB
        const newProduct = await this.productServiec.createProduct(product);

        //: Return response
        res.status(201).json({ id: newProduct._id });
    };

    update = async (
        req: ICreateProductRequest,
        res: Response,
        next: NextFunction,
    ) => {
        //: Validate the request
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        //: get product id from req.params
        const { productId } = req.params;

        //: Check product is present or not
        const oldImage = await this.productServiec.getProductImage(productId);
        if (!oldImage) {
            return next(createHttpError(404, "Product is not found!"));
        }

        //: Check file is sent by user while doing update
        let imageName: string | undefined;
        if (req.files?.image) {
            const image = req.files.image as UploadedFile;
            imageName = uuidv4();

            await this.storage.upload({
                fileName: imageName,
                fileData: image.data.buffer,
            });

            await this.storage.delete(oldImage);
        }

        //: get product data from req.body
        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body;

        //: prepare product object
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
            image: imageName ? imageName : oldImage,
        };

        //: update product in DB
        const updatedProduct = await this.productServiec.updateProduct(
            productId,
            product,
        );

        //: return response
        res.status(200).json({ id: updatedProduct?._id });
    };
}
