import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "config";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRouter from "./category/category-routes";
import productRouter from "./product/product-routes";
import toppingRouter from "./topping/topping-routes";

const app = express();
app.use(
    cors({
        origin: [config.get("client.uri")],
        credentials: true,
    }),
);

//: Add middleware for handle JSON data
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Hello from catalog service!!!" });
});

//: Register router
app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/toppings", toppingRouter);

//: Global error handler middleware
app.use(globalErrorHandler);

export default app;
