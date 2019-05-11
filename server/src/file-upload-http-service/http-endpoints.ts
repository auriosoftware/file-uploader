import { HttpEndpoint } from "../utils/express-api";
import { getLogger } from "../utils/logger";
import { uploadFile } from "./endpoint-handlers/handlers/upload-file";
import { downloadFile } from "./endpoint-handlers/handlers/download-file";
import { RequestContext } from "./request-context";

export const fileUploadHttpEndpoints: Array<HttpEndpoint<RequestContext>> = [
    {
        route: 'files',
        method: 'post',
        handler: uploadFile
    },
    {
        route: 'files/:filename',
        method: 'get',
        handler: downloadFile
    }
];

export const logger = getLogger('uploadFile');
