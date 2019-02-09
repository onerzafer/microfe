import { IncomingHttpHeaders } from "http";

export interface RequestPayload {
    url: string;
    headers: IncomingHttpHeaders;
    cookies: {[key: string]: string}[];
    queries: {[key: string]: string}[]
}