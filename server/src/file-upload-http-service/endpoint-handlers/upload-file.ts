import { Request, Response } from 'express';
import { RequestContext } from '../request-context';
import * as Busboy from 'busboy';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import { logger } from '../http-endpoints';
import { getErrorDetails, UserError } from '../../utils/errors';
import { isDefined, parse, parseNumber } from '../../utils/parse-utils';
import * as t from 'io-ts';
import { ChunkMetadata } from "../../chunked-files-assembler/chunked-file";
import { query } from "winston";

export function megaBytesToBytes(megaBytes: number): number {
    return megaBytes * 1000000;
}

export interface ResumableChunkQueryParams {
    resumableChunkNumber: string;
    resumableTotalChunks: string;
    resumableChunkSize: string;
    resumableTotalSize: string;
    resumableIdentifier: string;
    resumableFilename: string;
    resumableRelativePath: string;
}

export const chunkParamsValidator: t.Type<ResumableChunkQueryParams> = t.type({
    resumableChunkNumber: t.string,
    resumableTotalChunks: t.string,
    resumableChunkSize: t.string,
    resumableTotalSize: t.string,
    resumableIdentifier: t.string,
    resumableFilename: t.string,
    resumableRelativePath: t.string,
}, 'query');


export async function uploadFile(req: Request, res: Response, context: RequestContext) {

    assertContentType(req, 'multipart/form-data');

    const queryParams = parse(req.query, chunkParamsValidator);
    const chunkMetadata = getChunkMetadataFrom(queryParams);

    if (context.maximumFileSizeInBytes && chunkMetadata.totalSize > context.maximumFileSizeInBytes) {
        logger.debug(`File ${queryParams.resumableFilename} exceeds size limit (${context.maximumFileSizeInBytes} bytes), aborting.`);
        throw new UserError(`File exceeds maximum allowed size (${context.maximumFileSizeInBytes} bytes)`);
    }

    const worker = initWorker();
    let fileUploaded = false;

    worker.on('file', handleFile);
    worker.on('finish', handleFinish);
    req.pipe(worker);

    function initWorker() {
        try {
            return new Busboy({
                headers: req.headers,
                limits: {
                    fileSize: context.maximumFileSizeInBytes,
                    files: 1
                }
            });
        } catch (error) {
            logger.debug(`File upload failed ${getErrorDetails(error)}`);
            throw new UserError(`Invalid POST request: ${error.message}`);
        }
    }

    async function handleFile(fieldName: string, file: any, filename: string) {
        try {

            logger.debug(`Store "${chunkMetadata.fileId}" chunk ${chunkMetadata.chunkNumber}/${chunkMetadata.totalChunks}`);

            file.on('end', () => {
                if ((file as any).truncated) {
                    logger.debug(`File size limit (${context.maximumFileSizeInBytes} bytes) reached while uploading ${filename}`);
                    badRequest(`File exceeds maximum allowed size (${context.maximumFileSizeInBytes} bytes)`);
                    worker.end();
                } else {
                    fileUploaded = true;
                }
            });

            await context.chunksAssembler.writeChunk(chunkMetadata, file);
        } catch (error) {
            fail(error);
        }

        function fail(error: Error) {
            logger.error(`Internal error while uploading "${filename}": ${getErrorDetails(error)}'`);
            res.status(INTERNAL_SERVER_ERROR).send('File upload failed.').end();
        }

        function badRequest(message: string) {
            logger.debug(`User error while uploading "${filename}": ${message}'`);
            res.status(BAD_REQUEST).send(message).end();
        }

    }

    function handleFinish () {
        if (fileUploaded) {
            res.status(OK).end();
        } else {
            if (!res.headersSent) res.status(BAD_REQUEST).send('"file" form data field was missing or invalid - no file uploaded').end();
        }
    }
}

function assertContentType(request: Request, expectedContentType: string) {
    if (!request.is(expectedContentType)) throw new UserError(`Bad content type, expected ${expectedContentType}`);
}

export function getChunkMetadataFrom(params: ResumableChunkQueryParams): ChunkMetadata {
    return {
        fileName: params.resumableFilename,
        fileId: params.resumableIdentifier,
        totalChunks: parseNumber(params.resumableTotalChunks),
        chunkNumber: parseNumber(params.resumableChunkNumber),
        chunkSize:parseNumber(params.resumableChunkSize),
        totalSize: parseNumber(params.resumableTotalSize),
    }
}
