import { Injectable } from '@nestjs/common';

@Injectable()
export class UrlResolverService {
  resolve(requestedRoute: string, routes: string[]): string | undefined {
    return routes.find(route =>
      new RegExp(`^${route.replace(/\\\//g, '/').replace('*', '.*?')}`).test(
        requestedRoute
      )
    );
  }
}
