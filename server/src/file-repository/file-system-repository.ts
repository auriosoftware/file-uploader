import { FileNotFoundError, FileRepository } from './file-repository';
import { Readable, Writable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { fileExists } from '../utils/fs-utils';
import { getErrorDetails, InternalError } from '../utils/errors';
import { getLogger } from '../utils/logger';
import { promisify } from "util";

const logger = getLogger('FileSystemRepository');

export class FileSystemRepository implements FileRepository {

    constructor(private basePath: string) {

    }

    public async getFileReader(fileName: string): Promise<Readable> {
        const filePath = this.getRealPathOfFile(fileName);

        if (await fileExists(filePath)) {
            logger.debug(`Opened read stream for ${filePath}`);
            return fs.createReadStream(filePath);
        } else {
            logger.debug(`Failed to read from ${filePath}`);
            throw new FileNotFoundError(fileName);
        }
    }

    public async getFileWriter(fileName: string): Promise<Writable> {
        const filePath = this.getRealPathOfFile(fileName);

        try {
            logger.debug(`Starting write stream for file ${filePath}`);
            return fs.createWriteStream(filePath);
        } catch (error) {
            throw new InternalError(`Failed to write into ${filePath}: ${getErrorDetails(error)}`);
        }
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

}
