import * as fs from "fs";

export function fileExists(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
        fs.access(filePath, fs.constants.R_OK, (err) => {
            resolve(!err);
        });
    });
}

export function fileIsWritable(filePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.constants.W_OK, (err) => {
            if (err) console.error(err);
            resolve(!err);
        });
    });
}
