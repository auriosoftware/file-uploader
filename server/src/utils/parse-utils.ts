
export function parseOptionalNumber(str?: string): number | undefined {
    if (!isDefined(str)) return undefined;
    const num = parseInt(str, 10);
    if (isNaN(num)) throw new Error(`Failed to parse "${str}" as number`);
    return num;
}


export function isDefined<T>(value: T | null | undefined ): value is T {
    return value !== undefined && value !== null;
}
