import { Express } from 'express';
import * as express from 'express';
import { promisify } from 'util';
import { Server } from 'http';

export interface ServerConfig {
    host: string;
    port: number;
}

export class ExpressHttpServer {
    private serverInstance: Server | null = null;
    private express: Express;

    constructor(private config: ServerConfig) {
        this.express = express();
    }

    public getExpress() {
        return this.express;
    }

    public listen() {
        this.serverInstance = this.express.listen(this.config.port, this.config.host);
    }

    public async close(): Promise<void> {
        if (!this.serverInstance) return;
        return promisify(this.serverInstance.close)();
    }
}
