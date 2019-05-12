export type SignalHandler<T> = (value: T) => void;

export interface Signal<T> {
    (handler: SignalHandler<T>): void;

    fire(value: T): void;
}

export function signal<T>(): Signal<T> {
    const handlers: Array<SignalHandler<T>> = [];
    const s = function (handler: SignalHandler<T>) {
        handlers.push(handler);
    };

    s.fire = (value: T) => handlers.map(handler => handler(value));
    return s;
}
