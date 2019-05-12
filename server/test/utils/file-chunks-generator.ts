import { ResumableJsRequestParams } from '../../src/file-upload-http-service/adapters/resumable-js-request-params-adapter';

export interface TestChunkQuery {
    data: Buffer;
    queryParams: ResumableJsRequestParams;
}

export class FileChunksGenerator {

    private totalChunks: number;

    constructor(private file: Buffer, private fileName: string, private chunkSize: number) {
        this.totalChunks = Math.ceil(file.length / chunkSize);

    }

    public getChunk(chunkNumber: number): TestChunkQuery {
        const data = this.file.subarray((chunkNumber - 1) * this.chunkSize, (chunkNumber) * this.chunkSize);

        return {
            data,
            queryParams: {
                resumableChunkNumber: chunkNumber.toString(),
                resumableChunkSize: this.chunkSize.toString(),
                resumableTotalChunks: this.totalChunks.toString(),
                resumableRelativePath: this.fileName,
                resumableIdentifier: this.fileName,
                resumableFilename: this.fileName,
                resumableTotalSize: this.file.length.toString()
            }
        };
    }
}
