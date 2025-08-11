# wdir

**wdir** is a modular, plugin-based development framework for Node.js, designed for building CLI tools with a shared API.  
The core is **open-source**, but plugins can be open-source or private — making it flexible for personal or commercial use.

![License](https://img.shields.io/github/license/mojtaba5858/wdir)
![Version](https://img.shields.io/badge/version-1.2.0-blue)

---

## ✨ Features

- **Plugin Loader** — automatically loads plugins from the `/plugins` directory.
- **Standalone Plugin Support** — develop plugins in separate repositories and drop compiled `.js` into the plugins folder.
- **Context-based Logger** — colored logging with configurable levels per plugin or globally.
- **File Watcher API** — core provides file watching so plugins don’t need to implement their own.
- **Manifest System** — each plugin has its own `manifest.json` for metadata and optional log level.
- **Custom CLI Commands** — plugins can register their own commands using the `commander`-based API.
- **Cross-project Development** — plugins can be developed outside the `/plugins` folder and linked.

---

## 📦 Installation

```sh
# Clone the repository
git clone https://github.com/mojtaba5858/wdir.git
cd wdir

# Install dependencies
npm install

# Build
npm run build

# Run
npx wdir --help
# or if installed globally
wdir --help
```

---

## ⚙️ Configuration

The root configuration file is **`wdir.config.json`**.

Example:

```json
{
  "log": {
    "level": "info",
    "output": "console"
  },
  "plugin": {
    "active": true,
    "path": "path/to/plugins/folder"
  }
}
```

**Log Levels:**

| Level     | Value | Logs this + lower priority |
| --------- | ----- | -------------------------- |
| `verbose` | 0     | everything                 |
| `info`    | 1     | info, warn, error          |
| `debug`   | 2     | debug, info, warn, error   |
| `warn`    | 3     | warn, error                |
| `error`   | 4     | error only                 |
| `silent`  | 5     | nothing                    |

---

## 📂 Plugin Structure

A plugin lives in root of the wdir in `/plugins/{plugin-name}/` by default. But you can also set path of plugins by this command:

```sh
npx wdir --config plugin.path="path/to/plugins/folder"
# or if installed globally
wdir --config plugin.path="path/to/plugins/folder"
```

Example:

```
plugins/
  my-plugin/
    src/
      manifest.json
      index.ts
```

**manifest.json**

```json
{
  "name": "my-plugin",
  "entry": "index.bundle.js",
  "description": "Some description goes here...",
  "version": "1.0.0",
  "author": "YourName",
  "logLevel": "info"
}
```

---

## 🛠 Plugin Development

Inside your plugin's `index.ts`:

```ts
import type { WdirPluginAPI } from "wdir";

export default function (api: WdirPluginAPI) {
  api.logger.info("Plugin started!");

  api.registerCommand({
    name: "my-plugin",
    description: "A Wdir plugin for showing File Changes Logs",
    options: [
      {
        flag: "-f, --flag-name",
        description: "Some description of flag goes here...",
        defaultValue: false, // or anything you want
      },
    ],
    action(dir, options: Options) {
      api.watch.on("change", (file) => {
        api.logger.debug(`File changed: ${file}`);
      });
    },
    aliases: ["my-alias"],
  });
}
```

> [!IMPORTANT]
> You **must** export a default function in entry file, so plugin loader can read and load it.

---

## 🔌 Developing Plugins

You can create a standalone plugin in a separate repo:

```sh
mkdir my-plugin
cd my-plugin
npm init -y
```

Install `wdir`:

```sh
npm install wdir
```

Compile your plugin (e.g., with `tsc`), then copy the built `.js` alongside with your `manifest.json` into your `wdir/plugins/{your-plugin-name}/src` folder.

---

## 🧩 Example Plugins
- Snapshot – Automatic backup creator
- Watcher – Runs tasks on file changes

**PS:** You also can make your own custom plugins.

---

## 🖥 CLI Example Usage

Run `wdir` with options:

```sh
# by default it's same as CMD's path
wdir --dir ./src
```

Run a plugin command:

```sh
wdir my-plugin --my-flag --other-flag "other value flag"
```

---

## 🛡 License

MIT License — you can use the core freely.  
Plugins may be open-source or private at your discretion.

---

## 🤝 Contributing

Pull requests for the core are welcome.  
If you build a plugin you’d like to share, open an issue or PR to list it in the docs.
