import { Readable, Writable } from "stream";

export interface FileRepository {
    initialize(): Promise<void>;
    cleanup(): Promise<void>;
    getFileReader(fileName: string): Promise<Readable>;
    getFileWriter(fileName: string): Promise<Writable>;
}
