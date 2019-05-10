import { HttpEndpoint } from "../utils/http-api-server";
import { getLogger } from "../utils/logger";
import { uploadFile } from "./handlers/upload-file";
import { downloadFile } from "./handlers/download-file";


export const apiEndpoints: Array<HttpEndpoint> = [
    {
        route: '/files',
        method: 'POST',
        handler: uploadFile
    },
    {
        route: '/files/:filename',
        method: 'GET',
        handler: downloadFile
    }
];

export const logger = getLogger('uploadFile');
