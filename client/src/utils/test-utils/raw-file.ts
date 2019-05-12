export interface RawFile {
    uniqueIdentifier: string;
    progress: (relative: boolean) => number;
    size: number;
    fileName: string;
}
