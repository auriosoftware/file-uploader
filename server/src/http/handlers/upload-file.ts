import { Request, Response } from "express";
import { ActionContext } from "../../action-context/action-context";
import * as Busboy from "busboy";
import { INTERNAL_SERVER_ERROR, OK } from "http-status-codes";
import { logger } from "../http-endpoints";

export async function uploadFile(req: Request, res: Response, context: ActionContext) {
    const busboy = new Busboy({ headers: req.headers });

    busboy.on('file', async function(fieldname, file, filename) {
        try {
            const fileWriteStream = await context.fileRepository.getFileWriter(filename);

            logger.debug(`starting upload of ${filename} as ${filename}`);

            file.on('data', function(data) {
                fileWriteStream.write(data); //TODO handle failure
            });

            file.on('end', function() {
                logger.debug(`Finished uploading ${filename} as ${filename}.`);
                fileWriteStream.end(); //TODO wait for callback?
            });
        } catch (error) {
            logger.error(`Internal error uploading file ${filename}: ${error.message}\nStack trace: ${error.stack}'`);
            res.status(INTERNAL_SERVER_ERROR).send('file upload failed').end();
        }
    });

    busboy.on('finish', function() {
        res.status(OK).end();
    });

    req.pipe(busboy);
}
