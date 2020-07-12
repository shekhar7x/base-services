export interface BiRequestConfig {
    topics?: string[];
    connectionUri: string;
    queueGroup?: string;
}

export interface BiRequest {
    config?: BiRequestConfig;
    initiate(): Promise<any>;
    consume(topic: string, callbackFn: Function);
    request(path: string, message: { [key: string]: any });
}
