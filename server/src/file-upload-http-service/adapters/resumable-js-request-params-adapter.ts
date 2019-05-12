import { ChunkMetadata } from "../../chunked-files-assembler/chunked-file";
import { parseNumber } from "../../utils/parse-utils";
import * as t from "io-ts";


export interface ResumableJsRequestParams {
    resumableChunkNumber: string;
    resumableTotalChunks: string;
    resumableChunkSize: string;
    resumableTotalSize: string;
    resumableIdentifier: string;
    resumableFilename: string;
    resumableRelativePath: string;
}

export const resumableJsRequestParamsValidator: t.Type<ResumableJsRequestParams> = t.type({
    resumableChunkNumber: t.string,
    resumableTotalChunks: t.string,
    resumableChunkSize: t.string,
    resumableTotalSize: t.string,
    resumableIdentifier: t.string,
    resumableFilename: t.string,
    resumableRelativePath: t.string,
}, 'query');

export function getChunkMetadataFromResumableJsRequest(params: ResumableJsRequestParams): ChunkMetadata {
    return {
        fileName: params.resumableFilename,
        fileId: params.resumableIdentifier,
        totalChunks: parseNumber(params.resumableTotalChunks),
        chunkNumber: parseNumber(params.resumableChunkNumber),
        chunkSize: parseNumber(params.resumableChunkSize),
        totalSize: parseNumber(params.resumableTotalSize),
    }
}
