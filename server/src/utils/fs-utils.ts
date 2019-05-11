import * as fs from 'fs';

export function fileExists(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
        fs.access(filePath, fs.constants.R_OK, (err) => {
            resolve(!err);
        });
    });
}
