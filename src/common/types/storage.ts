export interface IFileData {
    fileName: string;
    fileData: ArrayBuffer;
}

export interface IFileStorage {
    upload(data: IFileData): Promise<void>;
    delete(fileName: string): Promise<void>;
    getObjectUri(fileName: string): string;
}
