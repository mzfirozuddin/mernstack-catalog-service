import express from "express";
import { asyncWrapper } from "../common/utils/asyncWrapper";
import { ProductController } from "./product-controller";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import createProductValidator from "./create-product-validator";
import { ProductService } from "./product-service";
import fileUpload from "express-fileupload";

const router = express.Router();

const productServiec = new ProductService();
const productController = new ProductController(productServiec);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload(),
    createProductValidator,
    asyncWrapper(productController.create),
);

export default router;
