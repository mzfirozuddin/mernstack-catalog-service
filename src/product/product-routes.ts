import express from "express";
import { asyncWrapper } from "../common/utils/asyncWrapper";
import { ProductController } from "./product-controller";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import createProductValidator from "./create-product-validator";

const router = express.Router();

const productController = new ProductController();
router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    createProductValidator,
    asyncWrapper(productController.create),
);

export default router;
