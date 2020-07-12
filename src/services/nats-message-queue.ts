import { MessageQueue, QueueConfig } from '../types/message-queue';

import { Client, connect, MsgCallback, Subscription } from 'ts-nats';

export class NatsMessageQueue implements MessageQueue {
    subsciptions: Subscription[] = [];
    config: QueueConfig;
    nc: Client;
    constructor(config: QueueConfig) {
        this.config = config;
        this.config.queueGroup = 'default.queue.group';
    }

    async initiate(): Promise<any> {
        this.nc = await connect(this.config.connectionUri);
        this.nc.on('error', (err) => {
            console.log(`[Nats error]`, err);
        });
        return this.nc;
    }

    async consume(topic: string, callbackFn: MsgCallback): Promise<any> {
        const sub = await this.nc.subscribe(topic, callbackFn, { queue: this.config.queueGroup });
        this.subsciptions.push(sub);
    }

    async produce(topic: string, message: { [key: string]: any }): Promise<any> {
        this.nc.publish(topic, JSON.stringify(message));
    }
}
