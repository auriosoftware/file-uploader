import { FileRepository } from './file-repository';
import { Dictionary } from '../utils/types';
import { Readable, Writable } from 'stream';
import { NotFoundError } from '../lib/errors';
import MemoryStream = require('memorystream');
import { isDefined } from "../utils/parse-utils";

export class InMemoryFileRepository implements FileRepository {
    private memory: Dictionary<Buffer> = {};

    public async getFileReader(fileName: string): Promise<Readable> {
        const data = this.memory[fileName];
        if (!data) throw new NotFoundError(`No such file: ${fileName}`);
        const stream = new MemoryStream();
        stream.push(data);
        stream.end();
        return stream;
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

    public async initialize(): Promise<void> {
        return;
    }

    public async cleanup(): Promise<void> {
        return;
    }

    public async removeFile(fileName: string): Promise<void> {
        delete this.memory[fileName];
    }

    public async hasFile(fileName: string): Promise<boolean> {
        return isDefined(this.memory[fileName]);
    }

}
