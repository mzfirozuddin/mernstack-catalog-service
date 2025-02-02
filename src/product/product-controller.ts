import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { ProductService } from "./product-service";
import { ICreateProductRequest, IFilter } from "./product-types";
import { IFileStorage } from "../common/types/storage";
import { AuthRequest } from "../common/types";
import { Roles } from "../common/constants";
import mongoose from "mongoose";
import { Logger } from "winston";

export class ProductController {
    //:- NOTE: Here we do manual binding of this. To avoid this we can replace clasic function to an arrow function
    // constructor(private productServiec: ProductService) {
    //     this.create = this.create.bind(this);
    // }

    constructor(
        private productServiec: ProductService,
        private storage: IFileStorage,
        private logger: Logger,
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
        const existingProduct = await this.productServiec.getProduct(productId);
        if (!existingProduct) {
            return next(createHttpError(404, "Product is not found!"));
        }

        //: Check current tenant manager has access to update product
        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenant = (req as AuthRequest).auth.tenant;
            // console.log("Tenant Id: ", tenant);
            if (existingProduct.tenantId !== tenant) {
                return next(
                    createHttpError(
                        "403",
                        "Forbidden: You are not allowed to access this product!",
                    ),
                );
            }
        }

        let oldImage: string | undefined;
        if (existingProduct.image) {
            oldImage = existingProduct.image;
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

            await this.storage.delete(oldImage as string);
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
        const productToUpdate = {
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
            productToUpdate,
        );

        //: return response
        res.status(200).json({ id: updatedProduct?._id });
    };

    listAll = async (req: Request, res: Response) => {
        const { q, tenantId, categoryId, isPublish } = req.query;

        //: Taking a empty filter object
        const filters: IFilter = {};

        //: Prepare the filters
        // console.log("isPublish: ", isPublish);
        if (isPublish === "true") {
            filters.isPublish = true;
        }

        if (tenantId) {
            filters.tenantId = tenantId as string;
        }

        if (
            categoryId &&
            mongoose.Types.ObjectId.isValid(categoryId as string)
        ) {
            //: getting "678408f2f0c79050c20777cc", converting into ObjectId('678408f2f0c79050c20777cc')
            filters.categoryId = new mongoose.Types.ObjectId(
                categoryId as string,
            );
        }

        const products = await this.productServiec.getProducts(
            q as string,
            filters,
        );
        // console.log("Products: ", products);
        this.logger.info("Getting product list successfully.");

        res.status(200).json(products);
    };
}
