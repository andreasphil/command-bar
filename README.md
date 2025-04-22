<h1 align="center">
  Command Bar 🐝
</h1>

<p align="center">
  <strong>⌘K command bar web component</strong>
</p>

- 🚀 Fast, efficient, keyboard driven UX
- 🍦 Vanilla JS, native web component that works everywhere
- 😌 Opinionated: it doesn't do much, but what it does is very easy to use
- 👌 Fully typed and tested

## Installation

From a CDN:

```ts
import { CommandBar } from "https://esm.sh/gh/andreasphil/command-bar@<tag>";
```

With a package manager:

```sh
npm i github:andreasphil/command-bar#<tag>
```

## Usage

Import the styling for the command bar in your app:

```ts
@import "@andreasphil/design-system/style.css" layer(theme);
@import "@andreasphil/command-bar/style.css";
```

Then import the component and `define` it:

```ts
import { CommandBar } from "@andreasphil/command-bar";

CommandBar.define();
```

After that, the component will be available in the HTML:

```html
<command-bar></command-bar>
```

If a command bar is present in the DOM, you can access it globally via `CommandBar.instance`. This will provide you with methods for registering and removing commands, as well as opening the bar manually:

```ts
import { CommandBar } from "@andreasphil/command-bar";

// This will be returned by the method for registering commands. We can use
// this to clean up commands only needed by specific components/views when
// the user navigates away from those.
let cleanup;

cleanup = CommandBar.instance.registerCommand({
  id: "a_command",
  name: "A command",
  // See the Command type for all available options
});
```

### API

See [commandBar.d.ts](./dist/commandBar.d.ts) for all available methods and docs.

## Development

> [!WARNING]
>
> (Some) spaghetti code ahead 🍝 I haven't really figured out a sensible way of managing state and rendering updates in vanilla web components yet. Let me know if you found one!

This library is built with [esbuild](https://esbuild.github.io). Packages are managed by [npm](https://npmjs.org). Tests are powered by [Node.js' test runner](https://nodejs.org/en/learn/test-runner/introduction). The following commands are available:

```sh
node --run dev          # Build the library and serve index.html in watch mode
node --run test         # Run tests once
node --run test:watch   # Run tests in watch mode
node --run build        # Typecheck, emit declarations and bundle
```

For a demo, open [index.html](./index.html) in a browser.

## Credits

This library uses a number of open source packages listed in [package.json](./package.json), as well as icons from [Lucide](https://lucide.dev).

Thanks 🙏
