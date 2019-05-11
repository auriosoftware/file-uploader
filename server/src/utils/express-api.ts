import { Express, Request, Response } from 'express';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, SERVICE_UNAVAILABLE } from 'http-status-codes';
import { getErrorDetails, NotFoundError, ServiceNotAvailableError, UserError } from './errors';
import { getLogger } from './logger';

export type HttpMethod = 'post' | 'get' | 'put' | 'delete';

export type HttpEndpointHandler<CONTEXT> = (request: Request, response: Response, context: CONTEXT) => any;

export interface HttpEndpoint<CONTEXT> {
    method: HttpMethod;
    route: string;
    handler: HttpEndpointHandler<CONTEXT>;
}

const logger = getLogger('HttpApiServer');

export type HttpRequestContextFactory<CONTEXT> = (request: Request) => Promise<CONTEXT>;

export interface ExpressEndpointsRegistration<CONTEXT> {
    endpoints: Array<HttpEndpoint<CONTEXT>>;
    contextFactory: HttpRequestContextFactory<CONTEXT>;
    apiVersion: number;
}

export function addApiEndpointsToExpressServer<CONTEXT>(express: Express, params: ExpressEndpointsRegistration<CONTEXT>) {
    logger.info(`Adding ${params.endpoints.length} new endpoints...`);

    params.endpoints.forEach(registerEndpoint);

    function registerEndpoint(endpoint: HttpEndpoint<CONTEXT>) {
        const finalRoute = `/v${params.apiVersion}/${endpoint.route}`;
        logger.debug(`Registering endpoint ${endpoint.method} ${finalRoute}`);

        express[endpoint.method](finalRoute, async (req, res) => {
            try {
                await createEndpointHandler(endpoint, req, res);
            } catch (error) {
                handleError(req, res, error);
            }
        });
    }

    async function createEndpointHandler(endpoint: HttpEndpoint<CONTEXT>, req: Request, res: Response): Promise<void> {
        const context = await params.contextFactory(req);
        logger.debug(`Request received on ${endpoint.route} from ${req.ip}`);
        await endpoint.handler(req, res, context);
    }

    function handleError(request: Request, response: Response, error: any): void {
        if (error instanceof NotFoundError) {
            logger.debug(`Sending not found error: ${getErrorDetails(error)}`);
            response.status(NOT_FOUND).send(error.message);
        } else if (error instanceof UserError) {
            logger.debug(`Sending bad request response: ${getErrorDetails(error)}`);
            response.status(BAD_REQUEST).send(error.message);
        } else if (error instanceof ServiceNotAvailableError) {
            logger.debug(`Sending service unavailable response: ${getErrorDetails(error)}`);
            response.status(SERVICE_UNAVAILABLE).send(error.message);
        } else {
            logger.error(`Unexpected error in request handler: ${getErrorDetails(error)}`);
            response.status(INTERNAL_SERVER_ERROR).send('Oops! Encountered internal error while processing request.').end();
        }
    }
}
