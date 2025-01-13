import express from "express";
import { CategoryController } from "./category-controller";
import categoryValidator from "./category-validator";
import updateCategoryValidator from "./update-category-validator";
import { CategoryServices } from "./category-services";
import logger from "../config/logger";
import { asyncWrapper } from "../common/utils/asyncWrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";

const router = express.Router();

const categoryService = new CategoryServices();
const categoryController = new CategoryController(categoryService, logger);
router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    categoryValidator,
    asyncWrapper(categoryController.create),
);

router.patch(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN]),
    updateCategoryValidator,
    asyncWrapper(categoryController.update),
);
//: We can handle "this" reference error below way ( We have seen previously in "auth service"). But in catalog service we will bind this in controller
// router.post(
//     "/",
//     categoryValidator,
//     (req: Request, res: Response, next: NextFunction) =>
//         categoryController.create(req, res, next),
// );

export default router;
