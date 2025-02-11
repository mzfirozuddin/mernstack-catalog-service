import { body, param } from "express-validator";

export default [
    //: Param
    param("toppingId")
        .exists()
        .withMessage("Topping id is required!")
        .isMongoId()
        .withMessage("Invalid topping id format"),

    //: Body
    body("name")
        .exists()
        .withMessage("Topping name is required!")
        .isString()
        .withMessage("Topping name should be a string!"),

    body("price").exists().withMessage("Topping price is required!"),
    body("tenantId").exists().withMessage("TenantId is required!"),
];
