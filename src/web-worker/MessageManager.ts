export class MessageManager {
    private readonly message: string;

    public constructor(message: string) {
        this.message = message;
    }

    public sayHello(location: string): void {
        console.info(`Hello from ${location}!`);
    }

    public printMessage(): void {
        console.info(`MESSAGE: ${this.message}`);
    }

    public initDB(): void {
        console.info('DB initialized');
    }
}
