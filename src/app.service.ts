import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class AppService {
  getMicroApp(microAppName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(
        `${__dirname}/micro-app-registry/${microAppName}/manifest.json`,
        { encoding: 'UTF8' },
        (err, file) => {
          if (err) {
            reject(err);
          } else {
            resolve(file);
          }
        },
      );
    }).then(
      (file: string) =>
        new Promise<string>((resolve, reject) => {
          const manifest = JSON.parse(file);
          fs.readFile(
            `${__dirname}/micro-app-registry/${microAppName}/${
              manifest.bundleName
              }`,
            { encoding: 'UTF8' },
            (err, appContentAsText) => {
              if (err) {
                reject(err);
              } else {
                resolve(
                  this.wrappTheApp({
                    appContentAsText,
                    name: manifest.name,
                    deps: manifest.dependencies
                      ? Object.keys(manifest.dependencies)
                      : [],
                  }),
                );
              }
            },
          );
        }),
    );
  }

  wrappTheApp({ appContentAsText, name, deps }): string {
    return `(function() {
        const microApp = {
            "name": "${name}",
            "deps": [${deps.map(dep => '"' + dep + '"').join(', ')}],
            "initialize": function(...deps) {
                return {
                  "exec": function(...args) { ((...args) => {${appContentAsText}})(...args, ...deps) }
                }
            }
        }
        if(window && window.AppsManager && window.AppsManager.register) {
            window.AppsManager.register(microApp);
        }
    })()`;
  }
}
