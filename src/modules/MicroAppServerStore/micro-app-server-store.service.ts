import { Injectable } from '@nestjs/common';
import { MicroAppServerDeclarationDTO } from '../../dto/micro-app-server-dto';
import { routeToRegExp, wildcardToRegExp } from '../../utilities/route.utils';
import { MicroAppGraph, MicroAppGraphItem } from 'src/interfaces/miro-app.interface';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class MicroAppServerStoreService {
    private microAppServerList: MicroAppGraph = {};
    constructor() {
        fs.readFile(join(__dirname, '../../topology.json'), 'utf8', (err, result) => {
            if (!err && result) {
                this.microAppServerList = JSON.parse(result) as MicroAppGraph;
            }
        });
    }

    add(declaration: MicroAppServerDeclarationDTO): Promise<boolean> {
        // check config for redis if available save declarations to redis if not use json db
        const tempList = { ...this.microAppServerList };
        tempList[declaration.appName] = { ...declaration };

        if (this.isCyclic(declaration.appName, tempList)) {
            Promise.reject('Cyclic dependency');
        } else {
            this.microAppServerList = { ...tempList };
            return Promise.resolve(true);
        }
    }

    mapRouteToMicroAppName(route: string): string {
        const foundMicroAppServerDeclaration: MicroAppServerDeclarationDTO = Object.keys(this.microAppServerList)
            .map(name => ({ ...this.microAppServerList[name] }))
            .filter(microApp => microApp.type === 'page')
            .find(declaration =>
                declaration.route.includes('*')
                    ? wildcardToRegExp(declaration.route).test(route)
                    : routeToRegExp(declaration.route).test(route)
            );
        return foundMicroAppServerDeclaration && foundMicroAppServerDeclaration.appName;
    }

    getDependencyList(appName: string, isRoot: boolean = false): MicroAppGraphItem[] {
        return this.traverseGraph(appName, this.microAppServerList, [], isRoot);
    }

    getMicroAppDeclarations() {
        return Object.keys(this.microAppServerList)
            .filter(key => this.microAppServerList[key].type === 'page')
            .map(key => ({
                ...this.microAppServerList[key],
            }));
    }

    private traverseGraph(
        initialPoint: string,
        graph: MicroAppGraph,
        cumulativeList: MicroAppGraphItem[],
        isRoot: boolean = false
    ): MicroAppGraphItem[] {
        const current = graph[initialPoint];
        const list = [];
        if (current && current.uses) {
            current.uses.forEach(nextPoint =>
                this.traverseGraph(nextPoint, graph, cumulativeList)
                    .filter(dep => dep)
                    .forEach(listItem => list.push(listItem))
            );
        }
        if (current && current.extends) {
            this.traverseGraph(current.extends, graph, cumulativeList)
                .filter(dep => dep)
                .forEach(listItem => list.push(listItem));
        }
        if (current) {
            list.push({
                ...current,
                isRoot: isRoot,
            });
        }
        return [...list];
    }

    private isCyclic(vertex: string, list: MicroAppGraph, visited = {}, recStack = {}): boolean {
        if (!visited[vertex]) {
            visited[vertex] = true;
            recStack[vertex] = true;
            const neighbours = (list[vertex] && list[vertex].uses) || [];
            for (let i = 0; i < neighbours.length; i++) {
                const current = neighbours[i];
                if (!visited[current] && this.isCyclic(current, list, visited, recStack)) {
                    return true;
                } else if (recStack[current]) {
                    return true;
                }
            }
        }
        recStack[vertex] = false;
        return false;
    }
}
