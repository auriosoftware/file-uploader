import { Request, Response } from "express";
import { RequestContext } from "../../request-context";
import * as Busboy from "busboy";
import { INTERNAL_SERVER_ERROR, OK } from "http-status-codes";
import { logger } from "../../http-endpoints";
import { getErrorDetails } from "../../../utils/errors";

export async function uploadFile(req: Request, res: Response, context: RequestContext) {
    const busboy = new Busboy({ headers: req.headers });

    busboy.on('file', async function(fieldname, file, filename) {
        try {
            const fileWriteStream = await context.fileRepository.getFileWriter(filename);

            logger.debug(`Starting upload of ${filename} as ${filename}`);

            fileWriteStream.on('error', fail);
            file.pipe(fileWriteStream);

            /*
            file.on('end', function() {
                logger.debug(`Finished uploading ${filename} as ${filename}.`);
                fileWriteStream.end(); //TODO wait for callback?
            });*/
        } catch (error) {
            fail(error);
        }

        function fail(error: Error) {
            logger.error(`Internal error while uploading "${filename}": ${getErrorDetails(error)}'`);
            res.status(INTERNAL_SERVER_ERROR).send('File upload failed.').end();
        }

    });

    busboy.on('finish', function() {
        succeed();
    });

    req.pipe(busboy);



    function succeed() {
        res.status(OK).end();
    }
}
