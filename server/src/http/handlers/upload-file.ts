import { Request, Response } from "express";
import { ActionContext } from "../../domain/action-context";
import * as Busboy from "busboy";
import { OK } from "http-status-codes";
import { logger } from "../http-endpoints";

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
