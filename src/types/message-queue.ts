export interface QueueConfig {
    topics?: string[];
    connectionUri: string;
    queueGroup?: string;
}

export interface MessageQueue {
    config?: QueueConfig;
    initiate(): Promise<any>;
    consume(topic: string, callbackFn: Function);
    produce(topic: string, message: { [key: string]: any });
}
