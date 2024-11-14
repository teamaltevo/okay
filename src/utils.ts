import type { Result } from "./result";

export function resultToString(result: Result<unknown, unknown>): string {
    const prefix = result.isOk ? 'Ok' : 'Err';
    return `${prefix}(${JSON.stringify(result.getOrNull() ?? result.errorOrNull(), null, 2)})`;
}