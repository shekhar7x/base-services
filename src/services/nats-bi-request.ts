import { Client, connect, MsgCallback, Subscription, Msg } from 'ts-nats';
import { BiRequest, BiRequestConfig, RequestPayload } from '../types/bi-request';

export class NatsBiRequest implements BiRequest {
    subsciptions: Subscription[] = [];
    config: BiRequestConfig;
    nc: Client;
    constructor(config: BiRequestConfig) {
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
    registerRoutes(routes = []) {
        routes = routes.filter((route) => !!route.subscriptionPath);
        routes.forEach((route) => {
            this.serve(route.subscriptionPath, route.handler).catch((e) => console.log('Nats:serve:error', e));
        });
    }
    async serve(path: string, handler: Function): Promise<any> {
        this.nc || (await this.initiate());
        const cb: MsgCallback = (err, message: Msg) => {
            try {
                if (err) throw err;

                const payload: RequestPayload = JSON.parse(message.data);
                handler(payload)
                    .then((result) => {
                        this.nc.publish(message.reply, JSON.stringify({ result: result }));
                    })
                    .catch((e) => {
                        if (typeof e === 'string') {
                            e = new Error(e);
                        }
                        const { message, statusCode, stack } = e;
                        this.nc.publish(message.reply, JSON.stringify({ error: { statusCode, message, stack } }));
                    });
            } catch (e) {
                console.log('[nats:subscription:error]', err);
                if (message && message.reply) {
                    this.nc.publish(message.reply, { error: JSON.stringify(err) });
                }
            }
        };
        const sub = await this.nc.subscribe(path, cb, { queue: this.config.queueGroup });
        this.subsciptions.push(sub);
    }

    async request(path: string, payload: RequestPayload): Promise<any> {
        this.nc || (await this.initiate());
        const response = await this.nc.request(path, 6000, JSON.stringify(payload));
        const { error, result } = JSON.parse(response.data);

        if (error) throw Object.assign(new Error(), error);

        return result;
    }
}
