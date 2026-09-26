# Bundlemonkey

Bundlemonkey is a userscript bundler designed to make developing browser userscripts blazing fast and efficient.

With TypeScript support and type-safe header comments, managing your code becomes a breeze.

Works well with [Tampermonkey](https://www.tampermonkey.net/), [Violentmonkey](https://violentmonkey.github.io/) or [Greasemonkey](https://www.greasespot.net/).

## Features

- **Lightning-Fast Builds**  
  Incredibly fast bundling speeds, thanks to [esbuild](https://esbuild.github.io/).

- **TypeScript Support**

- **Module Bundling**

- **Type-Safe Header Comments**  
  Write userscript header metadata in a type-safe and straightforward way. This not only minimizes errors but also makes your code much more maintainable.

- **Watch mode**

### Compilation Example

#### source

```typescript
// src/sample/message.ts

export const message = "Hello from sample script and bundlemonkey!";
```

```typescript
// src/sample/index.user.ts

import { defineUserScript } from "bundlemonkey";
import { message } from "./message";

export default defineUserScript({
  name: "Sample userscript",
  version: "1.0.0",
  description: "Write userscripts with ease using bundlemonkey!",
  match: ["https://example.com/*"],
  main: () => {
    console.log(message);
  },
});
```

#### output

```typescript
// ==UserScript==
// @name         Sample userscript
// @version      1.0.0
// @description  Write userscripts with ease using bundlemonkey!
// @match        https://example.com/*
// ==/UserScript==

// src/sample/message.ts
var message = "Hello from sample script and bundlemonkey!";

// src/sample/index.user.ts
void (() => {
  console.log(message);
})();
```

## Quick Start

### 1. Setup

You can set up new project quickly using the template ([1a](#1a-use-template)), or do it manually ([1b](#1b-setup-manually)).

#### 1a. Use template

```bash
npx bundlemonkey --create

# or like
pnpx bundlemonkey --create
bunx bundlemonkey --create
```

#### 1b. Setup manually

Install Bundlemonkey using npm, pnpm, or bun:

```bash
npm install --save bundlemonkey

# or like
pnpm add bundlemonkey
bun add bundlemonkey
```

Create a directory for your userscripts named with the slug under `src` directory. Your project structure might look like this:

<!-- https://tree.nathanfriend.com/?s=(%27options!(%27fancy3~fullPath!false~trailingSlash3~rootDot3)~5(%275%27src4a727**some-module64b02**0dist7%23%20bundled%20code%20goes%20here0bundlemonkey.config6%20%23optional0package.json%27)~version!%271%27)*%20%200%5Cn2**index.user63!true47script-5source!6.ts70*%017654320* -->

```bash
├── src/ # configurable
│   ├── script-a/
│   │   ├── index.user.ts
│   │   └── some-module.ts
│   └── script-b/
│       └── index.user.ts
├── dist/ # configurable
│   └── # bundled code goes here
├── bundlemonkey.config.ts # optional
└── package.json
```

> [!TIP]
> Source scripts are collected by glob `src/*/index.user.{ts,js}` by default, and [`srcDir`](#srcDir) is configurable.

### 2. Write your code

Head into any of the source scripts (`index.user.ts` or `index.user.js`) and start writing your code! See [Define UserScript](#define-userscript) section for more details.

### 3. Build

Run the following command to compile your code:

```bash
npx bundlemonkey

# or like
pnpx bundlemonkey
bunx bundlemonkey
```

Bundlemonkey compiles your code into `dist` directory.

[Watch mode](#watch-mode) and [Remote watch mode](#remote-watch-mode) are supported as well, so you can have it rebuild your scripts automatically. See [CLI](#cli) docs below for more details.

## Define Userscript

Each source script must define its main code, name, version, etc. using `defineUserScript` and export it as the default export. It might look like:

```typescript
import { defineUserScript } from "bundlemonkey";

export default defineUserScript({
  name: "Sample userscript",
  version: "1.0.0",
  description: "Write userscripts with ease using bundlemonkey!",
  match: ["https://example.com/*"],
  config: {
    message: "hello!",
  },
  main: (config) => {
    // your main code here!
    console.log(config.message);
  },
});
```

### Props of `defineUserScript`

Please see docs of [Tampermonkey](https://www.tampermonkey.net/documentation.php) or [Violentmonkey](https://violentmonkey.github.io/api/metadata-block/) for more details about props other than [`config`](#config) and [`main`](#main).

✅ - required

| name                        | type                               | default |
| :-------------------------- | :--------------------------------- | :------ |
| [config](#config)           | `T extends any`                    |
| [main](#main) ✅            | `(config: T) => unknown`           | ---     |
| name ✅                     | `string`                           | ---     |
| namespace                   | `string`                           |
| copyright                   | `string`                           |
| version ✅                  | `string`                           | ---     |
| description                 | `string`                           |
| icon                        | `string`                           |
| [grant](#grant)             | `Grant[] \| "none"`                | `[]`    |
| author                      | `string`                           |
| homepage                    | `string`                           |
| [antiFeature](#antifeature) | `AntiFeature[]`                    | `[]`    |
| require                     | `string[]`                         | `[]`    |
| resource                    | `{ name: string; url: string; }[]` | `[]`    |
| match                       | `string[]`                         | `[]`    |
| excludeMatch                | `string[]`                         | `[]`    |
| include                     | `string[]`                         | `[]`    |
| exclude                     | `string[]`                         | `[]`    |
| [runAt](#runat)             | `RunAt`                            |
| runIn                       | `string[]`                         | `[]`    |
| sandbox                     | `"raw" \| "JavaScript" \| "DOM"`   |
| injectInto                  | `"page" \| "content" \| "auto"`    |
| tag                         | `string[]`                         | `[]`    |
| connect                     | `string[]`                         | `[]`    |
| noframes                    | `boolean`                          | `false` |
| updateURL                   | `string`                           |
| downloadURL                 | `string`                           |
| supportURL                  | `string`                           |
| unwrap                      | `boolean`                          | `false` |
| topLevelAwait               | `boolean`                          | `false` |

#### Config

Config for the script which is intended to be modifiable by the users of your script.

If present, the value will be defined at the beginning of the compiled userscript as a variable named `userscriptConfig` to make it easy for users to edit.

For example:

```typescript
export default defineUserScript({
  // ...
  config: {
    /**
     * Edit this to change the message
     * @type string
     */
    message: "hello!",
  },
  main: (config) => {
    window.alert(config.message);
  },
});
```

will be compiled into:

```typescript
// ==UserScript==
// ...
// ==/UserScript==

var userscriptConfig = {
  /**
   * Edit this to change the message
   * @type string
   */
  message: "hello!",
};

void ((config) => {
  window.alert(config.message);
})(userscriptConfig);
```

#### Main

Your main userscript code.

It can be either a synchronous or an asynchronous function, and can receive [config](#config) as a prop.

#### Grant

[Tampermonkey docs](https://www.tampermonkey.net/documentation.php#meta:grant)

All APIs supported by Tampermonkey, Violentmonkey and Greasemonkey (`GM_*`, `GM.*`, `unsafeWindow`, `window.onurlchange`, `window.close` and `window.focus`) can be specified.

```typescript
type Grant =
  | "unsafeWindow"
  | "GM_addElement"
  | "GM_addStyle"
  // ...
  | "GM.addStyle"
  | "GM.setValue"
  // ...
  | "window.onurlchange"
  | "window.close"
  | "window.focus";
```

#### AntiFeature

[Tampermonkey docs](https://www.tampermonkey.net/documentation.php#meta:antifeature)

```typescript
type AntiFeature = {
  type: "ads" | "tracking" | "miner";
  description: string;
};
```

#### RunAt

[Tampermonkey docs](https://www.tampermonkey.net/documentation.php#meta:run_at)

```typescript
type RunAt = "document-end" | "document-start" | "document-body" | "document-idle" | "context-menu";
```

## Build Modes

### Production Mode

All source scripts will be compiled at once.

Compiled scripts will be located in [`dist.production`](#distproduction) directory.

### Watch Mode

Bundlemonkey monitors edits to the source scripts. When an edit is detected, it compiles the source and copies the output to the clipboard.
Please paste and save it in your userscripts manager's editor for use.

Compiled scripts will be located in [`dist.dev`](#distdev) directory.

### Remote Watch Mode

Similar to Watch mode, it monitors edits to the source scripts; however, in this mode, you do not need to paste into the editor every time you make changes.

When a source script is edited, a _remote_ script will be copied to the clipboard only the first time. Once you paste and save this remote script in your userscripts manager's editor, subsequent edits to the source script will be automatically reflected.

You need to allow your userscript manager access to local files to use this mode. Please refer to [Tampermonkey's FAQ](https://www.tampermonkey.net/faq.php?locale=en#Q204) for more details.

> [!TIP]
> A _remote_ script is a plain userscript that simply `@require`s the actual userscript code.

## CLI

```bash
bundlemonkey [--watch [--remote]] [--create]
```

### `--watch`

Enable [Watch mode](#watch-mode).

### `--remote`

Use with `--watch` to enable [Remote watch mode](#remote-watch-mode).

## Configuration

If you need to customize Bundlemonkey’s behavior, you can create a configuration file named `bundlemonkey.config.ts` or `bundlemonkey.config.js` in your project’s root directory.

### Example

`bundlemonkey.config.ts`

```typescript
import type { Config } from "bundlemonkey";

const config: Config = {
  srcDir: "src", // default value
  dist: {
    dev: ".dev", // default value
    production: "dist", // default value
  },
  defaultMeta: {
    author: "John Doe",
    namespace: "johndoe",
    homepage: "https://github.com/johndoe/userscripts",
    updateURL: ({ scriptName }) =>
      `https://github.com/johndoe/userscripts/raw/main/dist/${scriptName}.user.js`,
    downloadURL: ({ scriptName }) =>
      `https://github.com/johndoe/userscripts/raw/main/dist/${scriptName}.user.js`,
  },
};

export default config;
```

### srcDir

- type: `string`
- Default: `"src"`

Directory where your source scripts are located.

> [!NOTE]
> The glob for collecting the source files is like: `<cwd>/<srcDir>/*/index.user.{ts,js}`

### dist

- type: `object`

#### dist.dev

- type: `string`
- Default: `".dev"`

Dist directory in watch mode.

#### dist.production

- type: `string`
- Default: `"dist"`

### defaultMeta

- type: `object`
- Default: `undefined`

Default meta used for all userscripts. Metadata defined in [`defineUserScript`](#props-of-defineuserscript) overrides this.

All meta properties in [`defineUserScript`](#props-of-defineuserscript) can be used here as well, while `updateURL`/`downloadURL` have different signatures like below.

#### defaultMeta.updateURL

- type: `(args: { scriptName: string; version: string }) => string`
- Default: `undefined`

#### defaultMeta.downloadURL

- type: `(args: { scriptName: string; version: string }) => string`
- Default: `undefined`
