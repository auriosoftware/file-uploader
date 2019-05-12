import { DependencyInjector, FileUploadHttpService } from '../../src/file-upload-http-service/file-upload-http-service';
import { Express } from 'express';
import { InMemoryFileRepository } from '../../src/file-repository/in-memory-file-repository';
import * as request from 'supertest';
import { SuperTest, Test } from 'supertest';
import { FileRepository } from '../../src/file-repository/file-repository';
import { TestChunkQuery } from './file-chunks-generator';
import express = require('express');

export class FileUploadServiceTestBed {

    public express: Express;
    public fileRepository: FileRepository;
    public chunksRepository: FileRepository;
    public maximumFileSizeInBytes: number | undefined = undefined;
    public maximumChunkSizeInBytes: number | undefined = undefined;
    public service: FileUploadHttpService;

    constructor() {
        this.express = express();
        this.fileRepository = new InMemoryFileRepository();
        this.chunksRepository = new InMemoryFileRepository();
        this.service = new FileUploadHttpService();
    }

    public async startService(overrideDependencies: Partial<DependencyInjector> = {}): Promise<void> {
        await this.service.start({
            getExpress: async () => this.express,
            getFileUploadRepository: async () => this.fileRepository,
            getChunksRepository: async () => this.chunksRepository,
            maximumFileSizeInBytes: this.maximumFileSizeInBytes,
            maximumChunkSizeInBytes: this.maximumChunkSizeInBytes,
            apiBasePath: '',
            ...overrideDependencies
        });
    }

    public async stopService() {
        await this.service.stop('shutdown requested');
    }

    public request(): SuperTest<Test> {
        return request(this.express);
    }

    public uploadChunk(chunkData: TestChunkQuery) {
        return this.request()
            .post('/v1/files')
            .set('Content-Type', 'multipart\/form-data')
            .query(chunkData.queryParams)
            .attach('file', chunkData.data);
    }

    public uploadFile(filename: string, file: Buffer) {
        return this.request()
            .post('/v1/files')
            .set('Content-Type', 'multipart\/form-data')
            .attach('file', file, { filename });
    }

    public downloadFile(filename: string) {
        return this.request()
            .get(`/v1/files/${filename}`);
    }

}
