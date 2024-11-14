import { resultToString } from "./utils";

interface BaseResult<T, E> {
    /** Indicates if the result is a success. */
    isOk: boolean;
    
    /** Indicates if the result is an error. */
    isError: boolean;

    /**
     * Returns the successful value or null if it is an error.
     * @returns {T | null} The successful value or null.
     */
    getOrNull(): T | null;
    
    /**
     * Returns the successful value or a default value if it is an error.
     * @template T2 The type of the default value.
     * @param {T2} defaultVal The default value to return in case of an error.
     * @returns {T | T2} The successful value or the default value.
     */
    getOrDefault<T2>(defaultVal: T2): T | T2;
    
    /**
     * Returns the successful value or throws an exception if it is an error.
     * @returns {T} The successful value.
     * @throws {Error} If the result is an error.
     */
    getOrThrow(): T;
    
    /**
     * Returns the error or null if it is a success.
     * @returns {E | null} The error or null.
     */
    errorOrNull(): E | null;
    
    /**
     * Applies a function to the successful value and returns a new result.
     * @template T2 The type of the new successful value.
     * @param {(val: T) => T2} fn The function to apply to the successful value.
     * @returns {Result<T2, E>} A new result with the transformed value.
     */
    map<T2>(fn: (val: T) => T2): Result<T2, E>;
    
    /**
     * Applies a function to the error and returns a new result.
     * @template E2 The type of the new error.
     * @param {(val: E) => E2} fn The function to apply to the error.
     * @returns {Result<T, E2>} A new result with the transformed error.
     */
    mapError<E2>(fn: (val: E) => E2): Result<T, E2>;
    
    /**
     * Applies a function to the successful value or the error and returns the result.
     * @template T2 The type of the result.
     * @param {(val: T) => T2} okFn The function to apply to the successful value.
     * @param {(val: E) => T2} errFn The function to apply to the error.
     * @returns {T2} The result of applying the appropriate function.
     */
    fold<T2>(okFn: (val: T) => T2, errFn: (val: E) => T2): T2;
    
    /**
     * Executes a function if the result is a success.
     * @param {(val: T) => void} fn The function to execute.
     */
    onOk(fn: (val: T) => void): void;
    
    /**
     * Executes a function if the result is an error.
     * @param {(val: E) => void} fn The function to execute.
     */
    onError(fn: (val: E) => void): void;
    
    /**
     * Returns a string representation of the result.
     * @returns {string} The string representation of the result.
     */
    toString(): string;
}

interface OkResult<T> extends BaseResult<T, never> { 
    isOk: true;
    isError: false;
    value: T;
};

class OkImpl<T> implements OkResult<T> {
    readonly isOk = true;
    readonly isError = false;

    constructor(public value: T) {}

    getOrNull(): T | null {
        return this.value;
    }

    getOrDefault<T2>(): T | T2 {
        return this.value;
    }

    getOrThrow(): T {
        return this.value;
    }

    errorOrNull(): null {
        return null;
    }

    map<T2>(fn: (val: T) => T2): Result<T2, never> {
        return Ok(fn(this.value));
    }

    mapError<E2>(fn: (val: never) => E2): Result<T, E2> {
        return this;
    }

    fold<T2>(okFn: (val: T) => T2): T2 {
        return okFn(this.value);
    }

    onOk(fn: (val: T) => void): void {
        fn(this.value);
    }

    onError(): void {
        return;
    }

    toString(): string {
        return resultToString(this);
    }
    
}

interface ErrResult<E> extends BaseResult<never, E> { 
    isOk: false;
    isError: true;
    error: E;
};

class ErrImpl<E> implements ErrResult<E> {
    readonly isOk = false;
    readonly isError = true;

    constructor(public error: E) {}

    getOrNull(): null {
        return null;
    }

    getOrDefault<T2>(defaultVal: T2): T2 {
        return defaultVal;
    }

    getOrThrow(): never {
        throw this.error;
    }

    errorOrNull(): E | null {
        return this.error;
    }

    map<T2>(fn: (val: never) => T2): Result<T2, E> {
        return this;
    }

    mapError<E2>(fn: (val: E) => E2): Result<never, E2> {
        return Err(fn(this.error));
    }

    fold<T2>(_okFn: (val: never) => T2, errFn: (val: E) => T2): T2 {
        return errFn(this.error);
    }

    onOk(): void {
        return;
    }

    onError(fn: (val: E) => void): void {
        fn(this.error);
    }

    toString(): string {
        if (this.error instanceof Error) {
            return `Err(${this.error.message})`;
        } else {
            return resultToString(this);
        }
    }
}

/**
 * A generic result type that can be either a successful value (Ok) or an error (Err).
 * @template T The type of the successful value.
 * @template E The type of the error.
 */
export type Result<T, E> = OkResult<T> | ErrResult<E>;

/**
 * Represents a Promise of a Result.
 * Useful for asynchronous operations that may fail.
 * @template T The type of the success value
 * @template E The type of the error value
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>;

/**
 * Extracts the T type from a Result<T,E>.
 * Useful for type inference.
 * @template R The Result type from which to extract the success type
 */
export type ResultOkType<R extends Result<any, any>> = R extends OkResult<infer T> ? T : never;

/**
 * Extracts the E type from a Result<T,E>.
 * Useful for type inference.
 * @template R The Result type from which to extract the error type
 */
export type ResultErrType<R extends Result<any, any>> = R extends ErrResult<infer E> ? E : never;

/**
 * Creates a successful Result containing the provided value.
 * @template T The type of the value
 * @param val The value to wrap
 * @returns A successful Result containing the value
 */
export const Ok = <T>(val: T): OkResult<T> => new OkImpl(val);

/**
 * Creates an error Result containing the provided error.
 * @template E The type of the error
 * @param val The error to wrap
 * @returns An error Result containing the error
 */
export const Err = <E>(val: E): ErrResult<E> => new ErrImpl(val);

/**
 * Executes a function that may throw and returns its output wrapped in a Result.
 * If an exception is thrown, it's caught and wrapped in an error Result.
 * @template T The return type of the function
 * @param fn The function to execute
 * @returns A Result containing either the result or the caught error
 */
export const Try = <T>(fn: () => T): Result<T, Error> => {
    try {
        return Ok(fn());
    } catch (e: any) {
        return Err(e);
    }
}

/**
 * Async version of `Try`.
 * Executes an async function that may throw and returns its output wrapped in a Result.
 * If an exception is thrown, it's caught and wrapped in an error Result.
 * @template T The return type of the async function
 * @param fn The async function to execute
 * @returns A Promise of a Result containing either the result or the caught error
 */
export const TryAsync = async <T>(fn: () => Promise<T>): AsyncResult<T, Error> => {
    try {
        return Ok(await fn());
    } catch (e: any) {
        return Err(e);
    }
}