
export class UserError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, UserError.prototype);
    }
}

export class InternalError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, InternalError.prototype);
    }

}

export class NotFoundError extends UserError {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }

}

export class ServiceNotAvailableError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, ServiceNotAvailableError.prototype);
    }

}

export function getErrorDetails(error :Error) {
    return error.stack || error.message;
}
