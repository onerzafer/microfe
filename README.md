# _microfe-registry_

_(microfe - short for micro frontends)_

## Installation

```bash
$ npm install
mkdir micro-fe-registry
```

Then do the following for each app you would like to have in your micro-app tree

```bash
cp path/toyour/app/dist/folder micro-fe-registry/yourAppNameCamelCase
touch micro-fe-registry/yourAppNameCamelCase/micor-fe-manifest.json
```

For each micro-fe-registry.json file please refer the templates provided under [Microfe Manifest](#microfe-manifest)

## Helpful commands

### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# incremental rebuild (webpack)
$ npm run webpack
$ npm run start:hmr

# production mode
$ npm run start:prod
```

### Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Developing a Micro-app

microfe address some possible problems with some set of built-in solutions. Isolated app scope is solved by wrapping
the apps into web components.

-   For the app to app communication MicroAppStore is provided.
-   To share a global set of configuration Config is provided.
-   For async dependencies, AppsManager is the main app loader and provider
    All these solutions and more are provided by microfe as globals relative to micro-apps. Here these micro-app relative
    globals will be mentioned as Runtime Relative Globals.

## Runtime _Relative_ Global Variables

All micro-apps under micro-fe-registry will be wrapped into some templates just to be ready for consumption. Templates
are designed to provide a unified interface for each app and also scoping. According to a micro-app, defined variables
within this scope are global variables.

```TypeScript
interface MicroAppArgs {
    AppsManager: AppsManager;
    Config: ConfigInterface;
    conatiner: HTMLElement;
    [key: string]: any
}
// RELATIVE GLOBALS
const microAppArgs: MicroAppArgs;
const CONTAINER: HTMLElement;
const DOCUMENT: Document;
const WINDOW: Window;
```

All the declared dependencies will be provided under microAppArgs with given name as the key of the instance of the app.

### Microfe Manifest

Microfe-registry assumes a couple of different scenarios for each possible app and it is subject to changes in the
future. Supported and tested projects can be listed as below:

-   Static HTML, CSS and js interactions pages (no jquery support so far)
-   Single page apps build with major frameworks
-   JS apps with no UI

```JSON
{
  "name": "AppName",
  "version": "1.0.0",
  "type": "web component",
  "bundle": [
    {"type":  "template", "path":  "template.html"},
    {"type":  "html", "path":  "index.html"},
    {"type":  "js", "path":  "js/script.js"},
    {"type":  "css", "path":  "css/styles.css"}
  ],
  "globalBundle": [
      {"type":  "js", "path":  "js/global.script.js"},
      {"type":  "css", "path":  "css/global.styles.css"}
  ],
  "dependencies": {
    "OtherApp": "1.0.0",
    "SomeOtherApp": "1.0.0"
  }
}
```

The example above contains all possible values for a manifest file, but under normal conditions, you won't need all of
them at the same time.

-   **type**: _'web component' | 'webcomponent'_ use the type if and only if you have a web component or series of web
    components as your app, otherwise it is not recommended to use.
-   **bundle**: _{type: "template" | "html" | "js" | "css", path: string}[]_ at least one item under bundle is required.
    Under normal conditions, index.html has all the necessary paths for CSS and js and inline CSS and js, so if you
    provide the only index.html as a bundle all link and script and style tags will be included to your micro-app.
    For each bundle item, you have to define a **type** and a **path**. If you define more than one template or HTML
    bundle, the only first one will be provided under your app.
-   **globalBundle**: _{type: "js" | "css", path: string}[]_ Sometimes we need to inject something to global for
    instance @font-face is not supported under shadowDom so we need to inject it to global. For that kind of needs,
    globalBundle is provided. Use it wisely :)
-   **dependencies**: _{[key: string]: string}_ Within this property you may define all required micro-apps with their
    relevant versions. Currently, versions are not supported but will be in supported soon.

### Platform Specific Tips

#### Static SPA

Just copy files as is under micro-fe-registry folder and add necessary micro-fe-manifest.json and the app is ready to
run. Just notice if your spa is based on jquery, unfortunately, it will not work as micro-app because of non-supported
shadow dom usage.

#### React

If you are using create-react-app please refer its documentation for building the app for production. As a limitation
a micro-app has written in react please follow the instruction for static assets

```jsx harmony
// following implementation will have broken image as micro-app
import * as Logo from '.logo.svg';
const App = () => <Logo />;
```

Instead of the example above prefer the following one:

```jsx harmony
// after moving static asset to public folder or a cdn following example will work as expected
const MicroApp = () => <img src='path/to/logo.svg' />;
```

Then build your application and copy the dist folder as YourAppName under micro-fe-registry folder under the src folder.
After adding micro-fe-manifest.json the micro-app will work as expected.

#### Angular

The tricky one is Angular apps. An angular app should have Angular 6+ version to be built as a web component. Since
the mounting mechanism of angular is a little bit different than most of the popular frameworks it needs to be built
as a web component. The recommended tag name for your angular web component is your-app-name-container. When
microfe-registry wrapping angular app it exposes another web component with the tag your-app-name. By that way,
conflicting web component definition will be prevented. How to bundle an angular app as a web component can be
found under angular elements documentation. The rest is built the app for production, copy files under
micro-fe-registry folder and create the micro-fe-manifest.json file.

# License

[MIT](https://choosealicense.com/licenses/mit/)
