import { Injectable } from '@nestjs/common';
import * as Similarity from 'string-similarity';

interface Match {
  target: string;
  rating: number;
}
interface BestMatch {
  ratings: Match[];
  bestMatch: Match;
  bestMatchIndex: number;
}

@Injectable()
export class UrlResolverService {
  resolve(requestedRoute: string, routes: string[]): string {
    const wildcard = routes.find(route => route === '/*' || route === '*');
    const nonWildcardRoutes = routes.filter(
      route => route !== '/*' && route !== '*'
    );
    const matches: BestMatch = nonWildcardRoutes && nonWildcardRoutes.length && Similarity.findBestMatch(
      requestedRoute,
      nonWildcardRoutes
    );
    let resolved;

    if (nonWildcardRoutes && nonWildcardRoutes.length && matches.bestMatch.rating) {
      resolved = matches.bestMatch.target;
    } else if (wildcard) {
      resolved = wildcard;
    }

    return resolved;
  }
}
