import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRouter from "./category/category-routes";
import cookieParser from "cookie-parser";

const app = express();

//: Add middleware for handle JSON data
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Hello from catalog service!!!" });
});

//: Register router
app.use("/categories", categoryRouter);

//: Global error handler middleware
app.use(globalErrorHandler);

export default app;
