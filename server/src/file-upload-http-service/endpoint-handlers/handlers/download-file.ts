import { Request, Response } from "express";
import { RequestContext } from "../../request-context";
import { OK } from "http-status-codes";
import * as t from 'io-ts';
import { parse } from "../../../utils/parse-utils";

interface RouteParams {
    filename: string;
}

const routeParamsValidator : t.Type<RouteParams> = t.type({
    filename: t.string
}, 'route');

export async function downloadFile(req: Request, res: Response, context: RequestContext) {
    const params = parse(req.params, routeParamsValidator);

    const reader = await context.fileRepository.getFileReader(params.filename);
    res.header('Content-Disposition', `attachment; filename="${encodeURIComponent(params.filename)}"`).status(OK);
    reader.pipe(res);
}

