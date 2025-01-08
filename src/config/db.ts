import mongoose from "mongoose";
import config from "config";
import { DB_NAME } from "./constants";

export const initDB = async () => {
    try {
        // await mongoose.connect("mongodb://localhost:27017/catalog");

        await mongoose.connect(
            `${config.get<string>("database.url")}/${DB_NAME}`,
        );

        // eslint-disable-next-line no-console
        console.log("MongoDB Connected !!");
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log("ERR: Error in DB Connection!!");
        process.exit(1);
    }
};
