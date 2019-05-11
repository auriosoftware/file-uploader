import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { UserError } from './errors';

export function parseOptionalNumber(str?: string): number | undefined {
    if (!isDefined(str)) return undefined;
    const num = parseInt(str, 10);
    if (isNaN(num)) throw new Error(`Failed to parse "${str}" as number`);
    return num;
}

export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== undefined && value !== null;
}

export function parse<T>(value: unknown, validator: t.Type<T>): T {
    const validationResult = validator.decode(value);

    if (validationResult.isRight()) {
        return validationResult.value;
    } else {
        const errors = PathReporter.report(validationResult);
        throw new UserError(`Invalid arguments: ${errors.join('\n')}`);
    }
}
