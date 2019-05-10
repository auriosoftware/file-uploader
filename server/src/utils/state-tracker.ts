import { Logger } from "./logger";

export class StateTracker<T> {
    private currentState: T;

    constructor(initialState: T, private logger: Logger) {
        this.currentState = initialState;
    }

    public get(): T {
        return this.currentState;
    }

    public set(nextState: T) {
        this.logger.info(`${this.currentState} → ${nextState}`);
        this.currentState = nextState;
    }

    public assert(expectedState: T, errorMessage?: string) {
        if (this.currentState === expectedState) return;
        errorMessage = errorMessage || `Expected state ${expectedState} but current state is ${this.currentState}`
        throw new Error(errorMessage);
    }
}
