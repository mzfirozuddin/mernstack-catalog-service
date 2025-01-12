import express from "express";
import { CategoryController } from "./category-controller";
import categoryValidator from "./category-validator";
import { CategoryServices } from "./category-services";
import logger from "../config/logger";

const router = express.Router();

const categoryService = new CategoryServices();
const categoryController = new CategoryController(categoryService, logger);
router.post("/", categoryValidator, categoryController.create);

//: We can handle "this" reference error below way ( We have seen previously in "auth service"). But in catalog service we will bind this in controller
// router.post(
//     "/",
//     categoryValidator,
//     (req: Request, res: Response, next: NextFunction) =>
//         categoryController.create(req, res, next),
// );

export default router;
