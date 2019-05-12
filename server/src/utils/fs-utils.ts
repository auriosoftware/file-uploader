import * as fs from 'fs';
import { promisify } from 'util';

export function isFileReadable(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
        fs.access(filePath, fs.constants.R_OK, (err) => {
            resolve(!err);
        });
    });
}

export async function isDirectoryWritable(path: string): Promise<boolean> {

    if (!await isDirectory(path)) return false;

    return new Promise((resolve) => {
        fs.access(path, fs.constants.W_OK, (err) => {
            resolve(!err);
        });
    });
}

export async function isDirectory(path: string): Promise<boolean> {
    try {
        const stats = await promisify(fs.stat)(path);
        return stats.isDirectory();
    } catch (error) {
        return false;
    }
}

export async function isFile(path: string): Promise<boolean> {
    try {
        const stats = await promisify(fs.stat)(path);
        return stats.isFile();
    } catch (error) {
        return false;
    }
}
