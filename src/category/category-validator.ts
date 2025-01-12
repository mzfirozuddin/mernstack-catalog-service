import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Category name is required!")
        .isString()
        .withMessage("Category name should be a string!"),

    body("priceConfiguration")
        .exists()
        .withMessage("Price configuration is required!"),

    body("priceConfiguration.*.priceType")
        .exists()
        .withMessage("Price type is required!")
        // .isIn(["base", "additional"])  //! If we use .isIn([]) then we don't need custom()  function
        .custom((value: "base" | "additional") => {
            const validKeys = ["base", "additional"];
            if (!validKeys.includes(value)) {
                throw new Error(
                    `${value} is invalid attribute for priceType field. Possible values are: [${validKeys.join(
                        ", ",
                    )}]`,
                );
            }

            return true;
        }),

    body("attributes").exists().withMessage("Attributes fields are required!"),

    body("attributes.*.name")
        .exists()
        .withMessage("Attributes fields are required!")
        .isString()
        .withMessage("Attribute name should be a string!"),

    body("attributes.*.widgetType")
        .exists()
        .withMessage("Each attribute must have a widgetType!")
        .isIn(["switch", "radio"]) //+ Validate allowed widget types
        .withMessage("widgetType must be either 'switch' or 'radio'!"),
];
