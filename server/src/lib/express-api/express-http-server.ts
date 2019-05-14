import * as express from 'express';
import { Express } from 'express';
import { promisify } from 'util';
import { Server } from 'http';
import { getLogger } from '../logger';
import helmet = require('helmet');

export interface ServerConfig {
    host: string;
    port: number;
}

const logger = getLogger('ExpressHttpServer');

export class ExpressHttpServer {
    private serverInstance: Server | null = null;
    private express: Express;

    constructor(private config: ServerConfig) {
        this.express = express();
        this.express.use(helmet()); // protection against common vulnerabilities
    }

    public getExpress() {
        return this.express;
    }

    public listen() {
        logger.info(`Listening on ${this.config.host}:${this.config.port}`);
        this.serverInstance = this.express.listen(this.config.port, this.config.host);
    }

    public async close(): Promise<void> {
        if (!this.serverInstance || !this.serverInstance.listening) return;
        await promisify(this.serverInstance.close)();
    }
}
