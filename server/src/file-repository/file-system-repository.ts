import { FileRepository } from './file-repository';
import { Readable, Writable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { fileExists } from '../utils/fs-utils';
import { getLogger } from '../lib/logger';
import { promisify } from "util";

const logger = getLogger('FileSystemRepository');

export class FileSystemRepository implements FileRepository {

    constructor(private basePath: string) {

    }

    public async getFileReader(fileName: string): Promise<Readable> {
        const filePath = this.getRealPathOfFile(fileName);
        return fs.createReadStream(filePath);
    }

    public async getFileWriter(fileName: string): Promise<Writable> {
        const filePath = this.getRealPathOfFile(fileName);
        return fs.createWriteStream(filePath);
    }

    private getRealPathOfFile(fileName: string) {
        return path.join(this.basePath, fileName);
    }

    public async cleanup(): Promise<void> {
        //TODO!
        return;
    }

    public async initialize(): Promise<void> {
        //TODO!
        return;
    }

    public async removeFile(fileName: string): Promise<void> {
        await promisify(fs.unlink)(this.getRealPathOfFile(fileName));
    }

    public async hasFile(fileName: string): Promise<boolean> {
        return fileExists(this.getRealPathOfFile(fileName));
    }

}
