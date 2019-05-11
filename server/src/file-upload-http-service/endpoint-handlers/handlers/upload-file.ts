import { Request, Response } from 'express';
import { RequestContext } from '../../request-context';
import * as Busboy from 'busboy';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import { logger } from '../../http-endpoints';
import { getErrorDetails, UserError } from '../../../utils/errors';
import { isDefined } from '../../../utils/parse-utils';

export function megaBytesToBytes(megaBytes: number): number {
    return megaBytes * 1000000;
}

export async function uploadFile(req: Request, res: Response, context: RequestContext) {

    assertContentType(req, 'multipart/form-data');

    const worker = initWorker();
    let fileUploaded = false;

    worker.on('file', handleFile);
    worker.on('finish', handleFinish);
    req.pipe(worker);

    function initWorker() {
        try {
            return new Busboy({
                headers: req.headers,
                limits: {
                    fileSize: context.maximumFileSizeInBytes,
                    files: 1
                }
            });
        } catch (error) {
            logger.debug(`File upload failed ${getErrorDetails(error)}`);
            throw new UserError(`Invalid POST request: ${error.message}`);
        }
    }

    async function handleFile(fieldName: string, file: any, filename: string) {
        try {
            if (!isDefined(filename) || filename === '') {
                badRequest('filename not specified');
            }

            const fileWriteStream = await context.fileRepository.getFileWriter(filename);

            logger.debug(`Starting upload of "${filename}".`);

            fileWriteStream.on('error', fail);

            file.on('data', (data: any) => {
                fileWriteStream.write(data);
            });

            file.on('end', () => {
                logger.debug(`Finished uploading "${filename}".`);

                if ((file as any).truncated) {
                    logger.debug(`File size limit (${context.maximumFileSizeInBytes} bytes) reached while uploading ${filename}`);
                    fileWriteStream.destroy();
                    badRequest(`File exceeds maximum allowed size (${context.maximumFileSizeInBytes} bytes)`);
                    worker.end();
                } else {
                    fileUploaded = true;
                    fileWriteStream.end();
                }
            });

        } catch (error) {
            fail(error);
        }

        function fail(error: Error) {
            logger.error(`Internal error while uploading "${filename}": ${getErrorDetails(error)}'`);
            res.status(INTERNAL_SERVER_ERROR).send('File upload failed.').end();
        }

        function badRequest(message: string) {
            logger.debug(`User error while uploading "${filename}": ${message}'`);
            res.status(BAD_REQUEST).send(message).end();
        }

    }

    function handleFinish () {
        if (fileUploaded) {
            res.status(OK).end();
        } else {
            if (!res.headersSent) res.status(BAD_REQUEST).send('"file" form data field was missing or invalid - no file uploaded').end();
        }
    }
}

function assertContentType(request: Request, expectedContentType: string) {
    if (!request.is(expectedContentType)) throw new UserError(`Bad content type, expected ${expectedContentType}`);
}
