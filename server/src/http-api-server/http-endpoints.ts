import { HttpEndpoint } from "./http-server";
import { ActionContext } from "../domain/action-context";
import * as Busboy from 'busboy';
import { inspect } from "util";

import { Request, Response } from 'express';
import { InternalError } from "../errors";
import { getLogger } from "../util/logger";
import { OK } from "http-status-codes";


export const apiEndpoints: Array<HttpEndpoint> = [
    {
        route: '/files/:filename',
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

export async function uploadFile(req: Request, res: Response, context: ActionContext) {
    const busboy = new Busboy({ headers: req.headers });
    const targetFileName = req.params.filename;

    busboy.on('file', async function(fieldname, file, filename) {
       const fileWriter = await context.fileStore.getFileWriter(targetFileName);
        logger.debug(`starting upload of ${filename} as ${targetFileName}`);

        file.on('data', function(data) {
            fileWriter.write(data);
        });

        file.on('end', function() {
            logger.debug(`Finished uploading ${filename} as ${targetFileName}.`);
            fileWriter.end(); //TODO wait for callback?
        });
    });

    busboy.on('finish', function() {
        res.status(OK).end();
    });

    req.pipe(busboy);
}

export async function downloadFile(req: Request, res: Response, context: ActionContext) {
    const filename : string = req.params.filename; //TODO validate

    const reader = await context.fileStore.getFileReader(filename);

    res.status(OK);
    reader.pipe(res);
}
