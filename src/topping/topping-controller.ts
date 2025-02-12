import { NextFunction, Request, Response } from "express";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import { ToppingService } from "./topping-service";
import { IFileStorage } from "../common/types/storage";
import { ICreateToppingRequest, ITopping } from "./topping-types";
import { AuthRequest } from "../common/types";
import { Roles } from "../common/constants";

export class ToppingController {
    constructor(
        private toppingService: ToppingService,
        private storage: IFileStorage,
        private logger: Logger,
    ) {}

    create = async (
        req: ICreateToppingRequest,
        res: Response,
        next: NextFunction,
    ) => {
        //: Validate the request
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        //: Get image from req.file
        const image = req.files!.image as UploadedFile;

        //: image upload
        const imageName = uuidv4();

        await this.storage.upload({
            fileName: imageName,
            fileData: image.data.buffer,
        });
        // console.log("UploadResult: ", uploadResult);

        //: receive data from req.body
        const { name, price, tenantId } = req.body;

        //: Create topping
        const topping = {
            name,
            price,
            tenantId,
            image: imageName,
        };

        //: Save topping in DB
        const newTopping = await this.toppingService.createTopping(topping);

        this.logger.info("Topping created successfully.", {
            id: newTopping?._id,
        });

        res.status(201).json({ id: newTopping._id });
    };

    update = async (
        req: ICreateToppingRequest,
        res: Response,
        next: NextFunction,
    ) => {
        //: Validate the request
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        //: Receive topping id from req.params
        const { toppingId } = req.params;

        //: Check product is present or not
        const existingTopping = await this.toppingService.getTopping(toppingId);
        if (!existingTopping) {
            return next(createHttpError(404, "Topping is not found!"));
        }

        //: Check current tenant manager has access to update product
        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenant = (req as AuthRequest).auth.tenant;
            // console.log("Tenant Id: ", tenant);
            if (existingTopping.tenantId !== tenant) {
                return next(
                    createHttpError(
                        "403",
                        "Forbidden: You are not allowed to access this product!",
                    ),
                );
            }
        }

        let oldImage: string | undefined;
        if (existingTopping.image) {
            oldImage = existingTopping.image;
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

        //: receive data from req.body
        const { name, price, tenantId } = req.body;

        //: Create topping
        const topping = {
            name,
            price,
            tenantId,
            image: imageName ? imageName : oldImage,
        };

        //: Update data in DB
        const updatedTopping = await this.toppingService.updateTopping(
            toppingId,
            topping,
        );

        this.logger.info("Topping updated successfully.", {
            id: updatedTopping?._id,
        });

        res.status(200).json({ id: updatedTopping?._id });
    };

    listAll = async (req: Request, res: Response) => {
        const toppings = await this.toppingService.getToppings();

        //: Secondary Option
        // const finalToppings = (toppings as ITopping[]).map(
        //     (topping: ITopping) => {
        //         return {
        //             _id: topping._id,
        //             name: topping.name,
        //             price: topping.price,
        //             tenantId: topping.tenantId,
        //             image: this.storage.getObjectUri(topping.image as string),
        //             createdAt: topping.createdAt,
        //             updatedAt: topping.updatedAt,
        //         };
        //     },
        // );

        const finalToppings = toppings.map((topping: ITopping) => {
            return {
                ...topping,
                image: this.storage.getObjectUri(topping.image as string),
            };
        });

        this.logger.info("Getting topping list successfully.");

        res.status(200).json(finalToppings);
    };

    getSingle = async (req: Request, res: Response, next: NextFunction) => {
        const { toppingId } = req.params;
        const topping = await this.toppingService.getTopping(toppingId);

        if (!topping) {
            return next(createHttpError(404, "Topping is not found!"));
        }

        topping.image = this.storage.getObjectUri(topping.image as string);

        res.status(200).json(topping);
    };
    // delete = async (req: Request, res: Response, next: NextFunction) => {};
}
