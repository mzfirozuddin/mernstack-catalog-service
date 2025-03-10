import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { ProductService } from "./product-service";
import { ICreateProductRequest, IFilter, IProduct } from "./product-types";
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

        this.logger.info("Product created successfully.", {
            id: newProduct?._id,
        });

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

        this.logger.info("Product updated successfully.", {
            id: updatedProduct?._id,
        });

        //: return response
        res.status(200).json({ id: updatedProduct?._id });
    };

    listAll = async (req: Request, res: Response) => {
        const { q, tenantId, categoryId, isPublish, page, limit } = req.query;

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

        //: Making paginate query
        const paginateQuery = {
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 10,
        };
        // console.log("paginateQuery: ", paginateQuery);

        const products = await this.productServiec.getProducts(
            q as string,
            filters,
            paginateQuery,
        );
        // console.log("Products: ", products);
        this.logger.info("Getting product list successfully.");

        const finalProducts = (products.data as IProduct[]).map(
            (product: IProduct) => {
                return {
                    ...product,
                    image: this.storage.getObjectUri(product.image as string),
                };
            },
        );

        res.status(200).json({
            data: finalProducts,
            total: products.total,
            pageSize: products.limit,
            currentPage: products.page,
        });
    };

    getSingle = async (req: Request, res: Response, next: NextFunction) => {
        //: get product id from req.params
        const { productId } = req.params;

        //: Check product is present or not
        const product = await this.productServiec.getProduct(productId);
        if (!product) {
            return next(createHttpError(404, "Product is not found!"));
        }

        this.logger.info("Getting single product successfully.");

        //: get image uri for this product
        const productImageUri = this.storage.getObjectUri(
            product.image as string,
        );

        //: Replace image uri with image name
        product.image = productImageUri;

        res.status(200).json(product);
    };

    delete = async (req: Request, res: Response) => {
        //: get product id from req.params
        const { productId } = req.params;

        //: delete product from db
        const product = await this.productServiec.deleteProduct(productId);
        // console.log(product);

        //: Delete product image from s3
        await this.storage.delete(product?.image as string);

        res.status(200).json({
            msg: "Product deleted successfully.",
            id: product?._id,
        });
    };
}
