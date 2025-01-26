import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import config from "config";
import { IFileData, IFileStorage } from "../types/storage";

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
            await this.client.send(new PutObjectCommand(objectParams));
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error(String(error));
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    delete(fileName: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getObjectUri(fileName: string): string {
        throw new Error("Method not implemented.");
    }
}
