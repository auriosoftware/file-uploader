import { Readable, Writable } from 'stream';

export interface FileRepository {
    initialize(): Promise<void>;
    cleanup(): Promise<void>;
    hasFile(fileName: string): Promise<boolean>;
    removeFile(fileName: string): Promise<void>;
    getFileReader(fileName: string): Promise<Readable>;
    getFileWriter(fileName: string): Promise<Writable>;
}
