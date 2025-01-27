import express from "express";
import { asyncWrapper } from "../common/utils/asyncWrapper";
import { ProductController } from "./product-controller";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import createProductValidator from "./create-product-validator";
import { ProductService } from "./product-service";
import fileUpload from "express-fileupload";
import { S3Storage } from "../common/services/S3Storage";
import createHttpError from "http-errors";

const router = express.Router();

const productServiec = new ProductService();
const s3Storage = new S3Storage();
const productController = new ProductController(productServiec, s3Storage);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fieldSize: 500 * 1024 * 1024 }, //: 500kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeds the limit");
            next(error);
        },
    }),
    createProductValidator,
    asyncWrapper(productController.create),
);

export default router;
