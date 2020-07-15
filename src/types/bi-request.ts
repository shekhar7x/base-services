export interface BiRequestConfig {
    topics?: string[];
    connectionUri: string;
    queueGroup?: string;
}

export interface RequestPayload {
    body?: any;
    params?: any;
    query?: any;
}

export interface BiRequest {
    config?: BiRequestConfig;
    initiate(): Promise<any>;
    serve(path: string, callbackFn: Function);
    request(path: string, message: { [key: string]: any });
}
