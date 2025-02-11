import { NextFunction, Request, Response } from "express";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import { ToppingService } from "./topping-service";
import { IFileStorage } from "../common/types/storage";
import { ICreateRequestBody } from "./topping-types";

export class ToppingController {
    constructor(
        private toppingService: ToppingService,
        private storage: IFileStorage,
        private logger: Logger,
    ) {}

    create = async (
        req: Request<object, object, ICreateRequestBody>,
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

    // update = async (req: Request, res: Response, next: NextFunction) => {};
    // listAll = async (req: Request, res: Response, next: NextFunction) => {};
    // getSingle = async (req: Request, res: Response, next: NextFunction) => {};
    // delete = async (req: Request, res: Response, next: NextFunction) => {};
}
