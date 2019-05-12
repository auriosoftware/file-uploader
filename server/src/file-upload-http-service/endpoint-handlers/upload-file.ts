import { Request, Response } from 'express';
import { RequestContext } from '../request-context';
import { OK } from 'http-status-codes';
import { logger } from '../http-endpoints';
import { getErrorDetails, InternalError, UserError } from '../../lib/errors';
import { isDefined, parse } from '../../utils/parse-utils';
import { ChunkMetadata } from "../../chunked-files-assembler/chunked-file";
import { FileWithMetadata, processFileInPostRequest } from "../../lib/post-request-file-reader";
import {
    getChunkMetadataFromResumableJsRequest,
    resumableJsRequestParamsValidator
} from "../adapters/resumable-js-request-params-adapter";

export async function uploadFile(req: Request, res: Response, context: RequestContext) {

    assertContentType(req, 'multipart/form-data');

    const queryParams = parse(req.query, resumableJsRequestParamsValidator);
    const chunkMetadata = getChunkMetadataFromResumableJsRequest(queryParams);

    assertFileSizeUnderLimit(chunkMetadata, context.maximumFileSizeInBytes);
    assertChunkSizeUnderLimit(chunkMetadata, context.maximumChunkSizeInBytes);

    await processFileInPostRequest(req, { maximumChunkSizeInBytes: context.maximumChunkSizeInBytes },
        fileWithMetadata => storeChunk(fileWithMetadata, chunkMetadata, context));

    res.status(OK).end();
}

function assertContentType(request: Request, expectedContentType: string) {
    if (!request.is(expectedContentType)) throw new UserError(`Bad content type, expected ${expectedContentType}`);
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

async function storeChunk(fileWithMetadata: FileWithMetadata, chunkMetadata: ChunkMetadata, context: RequestContext) {
    try {
        logger.debug(`Store "${chunkMetadata.fileId}" chunk ${chunkMetadata.chunkNumber}/${chunkMetadata.totalChunks}`);

        await context.chunksAssembler.writeChunk(chunkMetadata, fileWithMetadata.file);
    } catch (error) {
        throw new InternalError(`Internal error while uploading "${fileWithMetadata.fileName}": ${getErrorDetails(error)}'`);
    }
}
