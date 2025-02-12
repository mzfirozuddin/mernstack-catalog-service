import express from "express";
import fileUpload from "express-fileupload";
import createHttpError from "http-errors";
import { asyncWrapper } from "../common/utils/asyncWrapper";
import { ToppingController } from "./topping-controller";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import createToppingValidator from "./create-topping-validator";
import { ToppingService } from "./topping-service";
import { S3Storage } from "../common/services/S3Storage";
import logger from "../config/logger";
import updateToppingValidator from "./update-topping-validator";

const toppingService = new ToppingService();
const s3Storage = new S3Storage();
const toppingController = new ToppingController(
    toppingService,
    s3Storage,
    logger,
);

const router = express.Router();

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fieldSize: 50 * 1024 }, // 500 kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const err = createHttpError(400, "File size exceeds the limit!");
            next(err);
        },
    }),
    createToppingValidator,
    asyncWrapper(toppingController.create),
);

router.put(
    "/:toppingId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fieldSize: 50 * 1024 }, // 500 kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const err = createHttpError(400, "File size exceeds the limit!");
            next(err);
        },
    }),
    updateToppingValidator,
    asyncWrapper(toppingController.update),
);

router.get("/", asyncWrapper(toppingController.listAll));

export default router;
