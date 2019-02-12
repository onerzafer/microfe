import { Request } from 'express';
import { RequestPayload } from 'src/interfaces/proxy.interface';
import { MicroAppGraphItem } from '../interfaces/miro-app.interface';

export const requestToParams = (request: Request): RequestPayload => ({
    url: request.originalUrl,
    headers: request.headers,
    cookies: request.cookies,
    queries: request.query,
});

export const mapMicroAppToMicroAppFragment = (microApp: MicroAppGraphItem) => response => ({
    ...microApp,
    fragment: response.data,
});
