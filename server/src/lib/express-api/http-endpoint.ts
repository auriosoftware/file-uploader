import { Request, Response } from "express";

export enum HttpMethod {
    POST = 'post',
    GET = 'get',
    PUT = 'put',
    DELETE = 'delete',
}

export type HttpEndpointHandler<CONTEXT> = (request: Request, response: Response, context: CONTEXT) => any;

export interface HttpEndpoint<CONTEXT> {
    method: HttpMethod;
    route: string;
    handler: HttpEndpointHandler<CONTEXT>;
}
