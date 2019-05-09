export type EventListener<EVENT> = (event: EVENT) => Promise<void>;

export class AsyncEventBus<EVENT> {

    private listenersMap = new Map<EVENT, Array<EventListener<EVENT>>>();

    public registerListener(event: EVENT, listener: EventListener<EVENT>) {
        if (this.listenersMap.has(event)) {
            this.listenersMap.get(event)!.push(listener);
        } else {
            this.listenersMap.set(event, [listener]);
        }
    }

    public async fire(event: EVENT): Promise<void> {
        if (this.listenersMap.has(event)) {
            await Promise.all(this.listenersMap.get(event)!.map(async (listener) => listener(event)));
        }
    }
}
