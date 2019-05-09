import { FileStore } from "../domain/file-store";
import { Dictionary } from "../util/types";
import { Readable, Writable } from "stream";
import { NotFoundError } from "../errors";
import MemoryStream = require("memorystream");

export class InMemoryFileStore implements FileStore {
    private memory: Dictionary<Buffer> = {};

    public async cleanup(): Promise<void> {
        return;
    }

    public async getFileReader(fileName: string): Promise<Readable> {
        const data = this.memory[fileName];
        if (!data) throw new NotFoundError(`No such file: ${fileName}`);
        const stream = new MemoryStream();
        stream.push(data);
        stream.end();
        return stream;
    }

    public async initialize(): Promise<void> {
        return;
    }

    public async getFileWriter(fileName: string): Promise<Writable> {
        const memStream = new MemoryStream();
        const chunks: Array<Buffer> = [];

        memStream.on('data', chunk => {
            chunks.push(chunk);
        });

        memStream.on('end', () => {
            this.memory[fileName] = Buffer.concat(chunks);
        });

        return memStream;
    }

}
