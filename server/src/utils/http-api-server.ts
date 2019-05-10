import { Express, Request, RequestHandler, Response } from 'express';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, SERVICE_UNAVAILABLE } from 'http-status-codes';
import { Server } from 'http';
import { ActionContext } from "../action-context/action-context";
import { NotFoundError, ServiceNotAvailableError, UserError } from "./errors";
import { getLogger } from "./logger";
import * as express from 'express';

export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';

export type HttpEndpointHandler = (request: Request, response: Response, context: ActionContext) => any;

export interface HttpEndpoint {
    method: HttpMethod;
    route: string;
    handler: HttpEndpointHandler;
}

const logger = getLogger('HttpApiServer');

export type HttpActionContextFactory = (request: Request) => Promise<ActionContext>;

export class HttpApiServer {

    private serverInstance: Server | null = null;
    private express = express();

    constructor(private contextFactory: HttpActionContextFactory) {
    }

    public addEndpoints(endpoints: Array<HttpEndpoint>) {
        logger.info(`Adding ${endpoints.length} new endpoints...`);

        for (const endpoint of endpoints) {
            switch (endpoint.method) {
                case 'POST':
                    this.registerEndpoint(endpoint, this.express.post.bind(this.express));
                    break;
                case 'GET':
                    this.registerEndpoint(endpoint, this.express.get.bind(this.express));
                    break;
            }
        }

    }

    private  registerEndpoint(endpoint: HttpEndpoint, fn: (route: string, handler: RequestHandler) => void) {
        const finalRoute = `/v1${endpoint.route}`;
        logger.debug(`registering endpoint ${endpoint.method} ${finalRoute}`);

        fn(finalRoute, async (req, res) => {
            try {
                const context = await this.contextFactory(req);
                logger.debug(`request received on ${endpoint.route}`);
                await endpoint.handler(req, res, context);
            } catch (error) {
                this.handleError(req, res, error);
            }
        });
    }

    private handleError(request: Request, response: Response, error: any) {
        if (error instanceof NotFoundError) {
            logger.debug(`Sending not found error: ${error.message}: ${JSON.stringify(error.stack)}`);
            response.status(NOT_FOUND).send(error.message);
        } else if (error instanceof UserError) {
            logger.debug(`Sending bad request response: ${error.message}: ${JSON.stringify(error.stack)}`);
            response.status(BAD_REQUEST).send(error.message);
        } else if (error instanceof ServiceNotAvailableError) {
            logger.debug(`Sending service unavailable response: ${error.message}: ${JSON.stringify(error.stack)}`);
            response.status(SERVICE_UNAVAILABLE).send(error.message);
        } else {
            logger.error(`Unexpected error in request handler: ${error.message}: ${JSON.stringify(error.stack)}`);
            response.status(INTERNAL_SERVER_ERROR).send('Oops! Encountered internal error while processing request.').end();
        }
    }

    public listen(host: string, port: number) {
        this.serverInstance = this.express.listen(port);
    }

    public getHttpServer(): Server {
        if (!this.serverInstance) {
            throw new Error('Cannot get http server instance - http server not started');
        }
        return this.serverInstance;
    }

    public async shutdown(): Promise<void> {
        if (!this.serverInstance) return;
        return new Promise(resolve => this.serverInstance!.close(() => resolve()));
    }
}



