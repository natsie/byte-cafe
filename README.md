# Byte Café ☕

A lovely café that serves you bytes.

Byte Café is a simple, lightweight, and configurable static file server for Node.js. It's perfect for serving single-page applications, static websites, or for local development.

## Features

- **Static file serving:** Serve static files from a specified directory.
- **Glob patterns:** Include or exclude files using glob patterns.
- **Customizable base path:** Serve files from a custom base path.
- **Port fallback:** Automatically try the next available port from a predefined list if the specified port is in use.
- **File streaming:** Efficiently stream large files.
- **Directory listing:** Serve an `index.html` file when a directory is requested.

### Planned Features

- **Range requests:** Support for `Range` headers for partial content delivery.
- **Authentication:** Basic authentication to protect your files.
- **Custom response headers:** Add custom headers to your responses.
- **Aliases:** Create aliases for your files and directories.

## Installation

```bash
npm install byte-cafe
```

## Usage

### Command-Line Interface (CLI)

Byte Café comes with a simple CLI for quick and easy serving.

```bash
npx byte-cafe [path] [port]
```

- `path` (optional): The base path to serve files from. Defaults to the current working directory.
- `port` (optional): The port to listen on. Defaults to `3333`.

**Example:**

Serve files from the `public` directory on port `8080`:

```bash
npx byte-cafe public 8080
```

### Programmatic Usage

Byte Café can also be used programmatically for more advanced configurations.

```typescript
import { Cafe } from "byte-cafe";

const cafe = new Cafe({
  basePath: "public",
  port: 8080,
  menu: {
    include: ["**/*.html", "**/*.css", "**/*.js"],
    exclude: ["**/*.map"],
  },
});

cafe.listen().then((cafe) => {
  console.log(`Café is open for business at http://localhost:${cafe.port}`);
});
```

## Configuration

The `Cafe` constructor accepts a configuration object with the following properties:

- `basePath` (optional, `string`): The base path to serve files from. Defaults to the current working directory.
- `port` (optional, `number`): The port to listen on. Defaults to `8080`.
- `menu` (optional, `object`): An object with `include` and `exclude` properties, which are arrays of glob patterns.
  - `include` (optional, `string[]`): An array of glob patterns to include. Defaults to `["**/*"]`.
  - `exclude` (optional, `string[]`): An array of glob patterns to exclude. Defaults to `[]`.
- `serveDirectories` (optional, `boolean`): Whether to serve directory listing when a directory is requested. Defaults to `false`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on our [GitHub repository](https://github.com/natsie/byte-cafe).

## License

Byte Café is licensed under the [MIT License](LICENSE).
