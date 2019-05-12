import { getLogger } from '../lib/logger';
import { uploadFile } from './endpoint-handlers/upload-file';
import { downloadFile } from './endpoint-handlers/download-file';
import { RequestContext } from './request-context';
import { HttpEndpoint, HttpMethod } from "../lib/express-api/http-endpoint";

export const fileUploadHttpEndpoints: Array<HttpEndpoint<RequestContext>> = [
    {
        route: '/files',
        method: HttpMethod.POST,
        handler: uploadFile
    },
    {
        route: '/files/:filename',
        method: HttpMethod.GET,
        handler: downloadFile
    }
];

export const logger = getLogger('uploadFile');
