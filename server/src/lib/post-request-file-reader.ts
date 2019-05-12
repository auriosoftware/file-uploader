import { Request } from "express";
import * as asyncBusboy from "async-busboy";
import { isDefined } from "../utils/parse-utils";
import { UserError } from "./errors";

export interface FileWithMetadata {
    field: string,
    file: NodeJS.ReadableStream,
    fileName: string,
}

export interface Options {
    maximumChunkSizeInBytes?: number,
}

export async function processFileInPostRequest(req: Request, options: Options, fileProcessor: (fileWithMetadata: FileWithMetadata) => Promise<void>): Promise<void> {
    let fileWithMetadata: FileWithMetadata | null = null;
    let fileProcessedPromise: Promise<void> | null = null;

    await asyncBusboy(req, {
        headers: req.headers,
        limits: {
            fileSize: options.maximumChunkSizeInBytes,
            files: 1
        },
        onFile(fieldName: string, file: any, fileName: string) {
            if (isDefined(fileWithMetadata)) return;
            fileWithMetadata = {file: file, fileName, field: fieldName};
            fileProcessedPromise = fileProcessor(fileWithMetadata);
        }
    });

    if (!fileWithMetadata || !fileProcessedPromise) throw new UserError('no file found in request');

    await fileProcessedPromise;
}
