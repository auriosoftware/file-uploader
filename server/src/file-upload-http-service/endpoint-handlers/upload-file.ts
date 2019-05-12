import { Request, Response } from 'express';
import { RequestContext } from '../request-context';
import { OK } from 'http-status-codes';
import { logger } from '../http-endpoints';
import { getErrorDetails, InternalError, UserError } from '../../lib/errors';
import { isDefined, parse, parseNumber } from '../../utils/parse-utils';
import * as t from 'io-ts';
import { ChunkMetadata } from "../../chunked-files-assembler/chunked-file";
import { query } from "winston";
import * as asyncBusboy from "async-busboy";

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

    assertFileSizeUnderLimit(chunkMetadata, context.maximumFileSizeInBytes);
    assertChunkSizeUnderLimit(chunkMetadata, context.maximumChunkSizeInBytes);

    await uploadFileFromPostRequest(req, chunkMetadata, context);

    res.status(OK).end();
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
        chunkSize: parseNumber(params.resumableChunkSize),
        totalSize: parseNumber(params.resumableTotalSize),
    }
}

export function assertFileSizeUnderLimit(chunkMetadata: ChunkMetadata, maximumSizeInBytes: number | undefined) {
    if (isDefined(maximumSizeInBytes) && chunkMetadata.totalSize > maximumSizeInBytes) {
        logger.debug(`File "${chunkMetadata.fileName}" exceeds size limit (${maximumSizeInBytes} bytes), aborting.`);
        throw new UserError(`File exceeds maximum allowed size (${maximumSizeInBytes} bytes)`);
    }
}

export function assertChunkSizeUnderLimit(chunkMetadata: ChunkMetadata, maxChunkSizeInBytes: number | undefined) {
    if (isDefined(maxChunkSizeInBytes) && chunkMetadata.chunkSize > maxChunkSizeInBytes) {
        logger.debug(`Chunk #${chunkMetadata.chunkNumber} of file "${chunkMetadata.fileName}" exceeds size limit (${maxChunkSizeInBytes} bytes), aborting.`);
        throw new UserError(`File Chunk #${chunkMetadata.chunkNumber} exceeds maximum allowed chunk size (${maxChunkSizeInBytes} bytes)`);
    }
}


export async function uploadFileFromPostRequest(req: Request, chunkMetadata: ChunkMetadata, context: RequestContext): Promise<void> {
    let fileProcessingPromise: Promise<void> | null = null;

    await asyncBusboy(req, {
        headers: req.headers,
        limits: {
            fileSize: context.maximumChunkSizeInBytes,
            files: 1
        },
        onFile(fieldName: string, file: any, filename: string) {
            if (isDefined(fileProcessingPromise)) return;
            fileProcessingPromise = processFile(file, filename);
        }
    });

    if (!isDefined(fileProcessingPromise)) throw new UserError('no file found in request');

    await fileProcessingPromise;

    async function processFile(file: any, filename: string) {
        try {
            logger.debug(`Store "${chunkMetadata.fileId}" chunk ${chunkMetadata.chunkNumber}/${chunkMetadata.totalChunks}`);

            file.on('end', () => {
                if ((file as any).truncated) {
                    logger.debug(`Chunk size limit (${context.maximumChunkSizeInBytes} bytes) reached while uploading ${filename}`);
                    throw new UserError(`Chunk exceeded maximum allowed size (${context.maximumChunkSizeInBytes} bytes)`);
                }
            });

            await context.chunksAssembler.writeChunk(chunkMetadata, file);
        } catch (error) {
            throw new InternalError(`Internal error while uploading "${filename}": ${getErrorDetails(error)}'`);
        }
    }
}

