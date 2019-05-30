import { Request } from 'express';
import { RequestPayload } from 'src/interfaces/proxy.interface';

export const requestToParams = (request: Request): RequestPayload => ({
  url: request.originalUrl,
  headers: request.headers,
  cookies: request.cookies,
  queries: request.query,
});
