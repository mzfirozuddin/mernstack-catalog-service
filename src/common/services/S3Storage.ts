import {
    DeleteObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import config from "config";
import { IFileData, IFileStorage } from "../types/storage";
import createHttpError from "http-errors";

export class S3Storage implements IFileStorage {
    private client: S3Client;

    constructor() {
        this.client = new S3Client({
            region: config.get("s3.region"),
            credentials: {
                accessKeyId: config.get("s3.accessKeyId"),
                secretAccessKey: config.get("s3.secretAccessKey"),
            },
        });
    }

    async upload(data: IFileData): Promise<void> {
        const objectParams = {
            Bucket: config.get("s3.bucket"),
            Key: data.fileName,
            Body: data.fileData,
        };

        //: We can wrap this in try catch. Here we use asyncWrapper so no need this
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return await this.client.send(new PutObjectCommand(objectParams));
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error(String(error));
            }
        }
    }

    async delete(fileName: string): Promise<void> {
        const objectParams = {
            Bucket: config.get("s3.bucket"),
            Key: fileName,
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return await this.client.send(new DeleteObjectCommand(objectParams));
    }

    getObjectUri(fileName: string): string {
        //: https://mernstack-pizza-app-project.s3.ap-south-1.amazonaws.com/2694953d-728a-4349-b19a-124d4a9ae716
        const bucket = config.get("s3.bucket");
        const region = config.get("s3.region");

        //: Narrowing down
        if (typeof bucket === "string" && typeof region === "string") {
            return `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
        }

        const error = createHttpError(500, "Invalid s3 configuration!");
        throw error;
    }
}
