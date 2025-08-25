interface ShimMessage {
    type: string;
    payload: any;
}

export class ShimListener {
    private messageBuffer: ShimMessage[] = [];
    private readonly maxBufferSize: number;

    public screenShotAddedCallback: () => void;

    constructor(maxBufferSize: number = 100, addedCallback: () => void) {
        this.maxBufferSize = maxBufferSize;
        this.initializeMessageListener();
        this.screenShotAddedCallback = addedCallback;
    }

    private initializeMessageListener(): void {
        window.addEventListener('message', (event: MessageEvent) => {
            this.handleMessage(event);
        });
    }

    private handleMessage(event: MessageEvent): void {
        try {
            const message = event.data as ShimMessage;
            this.addToBuffer(message);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    }

    private addToBuffer(message: ShimMessage): void {
        this.messageBuffer.push(message);

        // Remove oldest messages if buffer exceeds max size
        if (this.messageBuffer.length > this.maxBufferSize) {
            this.messageBuffer.shift();
        }

        this.screenShotAddedCallback();
    }

    public getBuffer(): ShimMessage[] {
        return [...this.messageBuffer];
    }

    public clearBuffer(): void {
        this.messageBuffer = [];
    }

    public destroy(): void {
        window.removeEventListener('message', this.handleMessage);
    }
}