export function megaBytesToBytes(megaBytes: number): number {
    return megaBytes * 1024 * 1024;
}

export function bytesToMegaBytes(bytes: number): number {
    return Math.floor(bytes / (1024 * 1024));
}
