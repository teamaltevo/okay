# @altevo/okay

A TypeScript library that elegantly handles operation outcomes through a powerful `Result` type, representing either success (`Ok`) or failure (`Err`). 

Inspired by Rust and Kotlin, it brings compile-time error checking and type safety to error handling in TypeScript.

This library eliminates the need for verbose try/catch blocks and null checks by making error handling explicit and type-safe.

## Installation

You can install the library through npm:

```bash
npm install @altevo/okay
```

## Examples

### Basic Usage

```typescript
import { Ok, Err, type Result } from '@altevo/okay';

// Function that returns a Result
function divide(a: number, b: number): Result<number, string> {
    if (b === 0) {
        return Err("Division by zero");
    }
    return Ok(a / b);
}

const result = divide(4, 2);

if (result.isOk) {
    // Here we can safely access the value with the proper typing `number`
    console.log("Success:", result.value);
} else {
    // Here we can safely access the error with the proper typing `string`
    console.log("Error:", result.error);
}
```

### Handling Results

You can use various methods provided by the `Result` class to handle the result in a more functional way:

```typescript
const result = divide(4, 0);

// Get the value or null
const valueOrNull = result.getOrNull();

// Get the value or a default value
const valueOrDefault = result.getOrDefault(1);

// Get the value or throw an error
try {
    const value = result.getOrThrow();
} catch (error) {
    console.error("Caught error:", error);
}

// Transform the ok value with a function 
const mappedResult = result.map(value => value * 2);

// Transform the error value with a function
const mappedErrorResult = result.mapError(error => `Error: ${error}`);

// Fold the result into a single value, depending on the state of the result
const foldedValue = result.fold(
    value => `Success: ${value}`,
    error => `Error: ${error}`
);

// Execute a function if the result is a success
result.onOk(value => console.log("Success:", value));

// Execute a function if the result is an error
result.onError(error => console.error("Error:", error));
```

### Catching Errors with `Try`

You can use the `Try` utility to wrap a function that might throw an error. If the function throws an error, it will be caught and returned as an `Err` result.

```ts
import { Try } from '@altevo/okay';

function doSomethingThatMightThrow(): number {
    if (Math.random() < 0.5) {
        return 42;
    } else {
        throw new Error("Something went wrong");
    }
}

// Here tryResult is Result<number, Error>
const tryResult = Try(doSomethingThatMightThrow)
```

### Asynchronous Results

The same principle apply to asynchronous functions. You can use the `TryAsync` utility to wrap an asynchronous function that might throw an error.


```typescript
import { TryAsync } from '@altevo/okay';

async function fetchData(): Promise<string> {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return await response.text();
}

const asyncResult = await TryAsync(fetchData); 
// After await, asyncResult would be Result<string, Error>

result.fold(
    value => console.log("Fetched data:", value),
    error => console.error("Failed to fetch data:", error)
);
```

## API

Here are the main types and functions provided by the library

### Types

-  `Result<T, E>`: A type that represents either a successful value (`Ok<T>`) or an error (`Err<E>`). A result is either `Ok` or `Err`, never both and its immutable.

- `AsyncResult<T, E>`: A type that represents a promise of a `Result<T, E>`. (It is an alias of `Promise<Result<T, E>>`)

### Functions

- `Ok<T>(val: T): OkResult<T>`: Creates a successful result.

- `Err<E>(val: E): ErrResult<E>`: Creates an error result.

- `Try<T>(fn: () => T): Result<T, Error>`: Executes a function and returns a result with the function's return value. If the inner function throws an error, it returns an `Err` result.

- `TryAsync<T>(fn: () => Promise<T>): AsyncResult<T, Error>`: Same as `Try`, but for asynchronous functions, returning a promise. The inner function will be awaited, and the result will be wrapped in a promise.

> [!NOTE]
All methods of the `Result` class are documented as JSDoc comments in the source code.

## Attribution

This library was inspired by the native `Result` implementation in [Rust](https://doc.rust-lang.org/std/result/enum.Result.html) and [Kotlin](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-result/), and it aims to provide a similar experience for TypeScript projects.

The implementation was deeply influenced by the [`ts-results`](https://github.com/vultix/ts-results) library, but it was rewritten from scratch to provide a simpler and friendlier API, similar to Kotlin's `Result` class.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
