import { Readable, Writable } from 'stream';
import { NotFoundError } from '../utils/errors';

export interface FileRepository {
    initialize(): Promise<void>;
    cleanup(): Promise<void>;
    hasFile(fileName: string): Promise<boolean>;
    removeFile(fileName: string): Promise<void>;
    getFileReader(fileName: string): Promise<Readable>;
    getFileWriter(fileName: string): Promise<Writable>;
}

export class FileNotFoundError extends NotFoundError {
    constructor(fileName: string) {
        super(`File not found: "${fileName}".`);
    }
}
