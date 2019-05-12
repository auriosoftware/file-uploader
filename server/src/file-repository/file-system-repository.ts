import { FileNotFoundError, FileRepository } from './file-repository';
import { Readable, Writable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { isDirectoryWritable, isFileReadable } from '../utils/fs-utils';
import { getLogger } from '../lib/logger';
import { promisify } from 'util';

const logger = getLogger('FileSystemRepository');

export class FileSystemRepository implements FileRepository {

    constructor(private basePath: string) {

    }

    public async getFileReader(fileName: string): Promise<Readable> {
        if (!isFileReadable(fileName)) throw new FileNotFoundError(fileName);
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
        return;
    }

    public async initialize(): Promise<void> {
        if (!await isDirectoryWritable(this.basePath)) {
            throw new Error(`Cannot initialize file repository: Cannot write into directory ${this.basePath}`);
        }
    }

    public async removeFile(fileName: string): Promise<void> {
        await promisify(fs.unlink)(this.getRealPathOfFile(fileName));
    }

    public async hasFile(fileName: string): Promise<boolean> {
        return isFileReadable(this.getRealPathOfFile(fileName));
    }

}
