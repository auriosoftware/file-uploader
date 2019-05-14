import { signal } from '../lib/signal';

export class Countdown {
    public onExpired = signal<void>();
    private currentTimer?: NodeJS.Timer;

    constructor(private intervalInMs: number) {
        this.renew();
    }

    public renew() {
        this.stop();
        this.currentTimer = setTimeout(() => this.onExpired.fire(), this.intervalInMs);
    }

    public stop() {
        if (this.currentTimer) clearTimeout(this.currentTimer);
    }
}
