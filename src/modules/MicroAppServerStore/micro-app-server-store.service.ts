import { Injectable } from '@nestjs/common';
import { MicroAppServerDeclarationDTO } from '../../dto/micro-app-server-dto';
import { wildcardToRegExp } from '../../utilities/route.utils';
import { MicroAppGraphItem } from 'src/interfaces/miro-app.interface';

@Injectable()
export class MicroAppServerStoreService {
    private microAppServerList: { [key: string]: MicroAppServerDeclarationDTO } = {
        mock: { appName: 'mock', accessUri: 'https://www.google.com', route: '', uses: undefined },
    };
    add(declaration: MicroAppServerDeclarationDTO): Promise<boolean> {
        // check config for redis if available save declarations to redis if not use json db
        // validate dependencies and reject if there is circular dependencies
        this.microAppServerList[declaration.appName] = { ...declaration };
        return Promise.resolve(true);
    }

    mapRouteToMicroAppName(route: string): string {
        const foundMicroAppServerDeclaration: MicroAppServerDeclarationDTO = Object.keys(this.microAppServerList)
            .map(name => ({ ...this.microAppServerList[name] }))
            .find(declaration =>
                declaration.route.includes('*')
                    ? wildcardToRegExp(declaration.route).test(route)
                    : declaration.route === route
            );
        return foundMicroAppServerDeclaration && foundMicroAppServerDeclaration.appName;
    }

    getDependencyList(appName: string): MicroAppGraphItem[] {
        // assuming there is no circular dependencies in the list
        return [
            { appName: 'mock', accessUri: 'http://localhost:3001', isRoot: true }
        ];
    }

    private traverseGraph() {}
}
