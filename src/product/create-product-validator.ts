import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Product name is required!")
        .isString()
        .withMessage("Product name should be string!"),

    body("description")
        .exists()
        .withMessage("Product description is required!")
        .isString()
        .withMessage("Product description should be string!"),

    body("priceConfiguration")
        .exists()
        .withMessage("Product priceConfiguration is required!"),

    body("attributes").exists().withMessage("Product attributes is required!"),
    body("tenantId").exists().withMessage("Tenant id is required!"),
    body("categoryId").exists().withMessage("Category id is required!"),
    body("image").custom((value, { req }) => {
        if (!req.files) {
            throw new Error("Product image is required!");
        }

        return true;
    }),
];
