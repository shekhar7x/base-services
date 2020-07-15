import { MessageQueue, QueueConfig } from '../types/message-queue';

import { Client, connect, MsgCallback, Subscription, NatsError, Msg } from 'ts-nats';

export class NatsMessageQueue implements MessageQueue {
    subsciptions: Subscription[] = [];
    config: QueueConfig;
    nc: Client;
    constructor(config: QueueConfig) {
        this.config = config;
        this.config.queueGroup = 'default.queue.group';
    }

    async initiate(): Promise<any> {
        if (this.nc) return this.nc;

        this.nc = await connect(this.config.connectionUri);
        this.nc.on('error', (err) => {
            console.log(`[Nats error]`, err);
        });
        return this.nc;
    }

    async consume(topic: string, callbackFn: (err: NatsError | null | Error, message?: any) => void): Promise<any> {
        this.nc || (await this.initiate());

        const cb: MsgCallback = (err, message: Msg) => {
            try {
                if (err) {
                    throw err;
                }
                const data = JSON.parse(message.data);
                callbackFn(null, data);
            } catch (e) {
                callbackFn(e);
            }
        };
        const sub = await this.nc.subscribe(topic, cb, { queue: this.config.queueGroup });
        this.subsciptions.push(sub);
    }

    async produce(topic: string, message: { [key: string]: any }): Promise<any> {
        this.nc || (await this.initiate());

        this.nc.publish(topic, JSON.stringify(message));
    }
}
