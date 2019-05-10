import { Request, Response } from "express";
import { ActionContext } from "../../domain/action-context";
import { OK } from "http-status-codes";


export async function downloadFile(req: Request, res: Response, context: ActionContext) {
    const filename : string = req.params.filename; //TODO validate

    const reader = await context.fileStore.getFileReader(filename);

    res.status(OK);
    reader.pipe(res);
}
