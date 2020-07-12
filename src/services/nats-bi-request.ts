import { Client, connect, MsgCallback, Subscription } from 'ts-nats';
import { BiRequest, BiRequestConfig } from '../types/bi-request';

export class NatsBiRequest implements BiRequest {
    subsciptions: Subscription[] = [];
    config: BiRequestConfig;
    nc: Client;
    constructor(config: BiRequestConfig) {
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

    async request(path: string, message: { [key: string]: any }): Promise<any> {
        const result = await this.nc.request(path, 6000, JSON.stringify(message));
        return result;
    }
}
