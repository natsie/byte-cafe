import { createServer } from "node:http";
import { defer, nonNull } from "./utils.ts";
import type { ICafe } from "./types.ts";
import { createRequestListener, getCafeData, registerCafe } from "./internal.ts";

const createCafeData = (instance: Cafe, config: ICafe.UserConfig): ICafe.Data => ({
  server: createServer(),
  listening: false,

  alias: typeof config.alias === "object" ? config.alias : {},
  basePath: typeof config.basePath === "string" ? config.basePath : process.cwd(),
  menu: {
    include: Array.from(config.menu?.include || ["**/*"]),
    exclude: Array.from(config.menu?.exclude || []),
  },
  parsePresets: config.parsePresets != null ? !!config.parsePresets : false,
  port: config.port != null ? ~~config.port : 8080,
  serveDirectories: config.serveDirectories != null ? !!config.serveDirectories : false,
});

class Cafe {
  constructor(config: ICafe.UserConfig = {}) {
    registerCafe(this, createCafeData(this, config));
  }

  get port(): number {
    return getCafeData(this).port;
  }

  listen(
    port?: number | number[] | null,
    callback?: (cafe: Cafe) => unknown,
  ): Promise<Cafe> {
    const data = getCafeData(this);
    if (data.listening) return Promise.resolve(this);

    const ports = port == null ? [data.port] : Array.isArray(port) ? port : [port];
    return new Promise(async (resolve, reject) => {
      const listenErrors = new Set(["EACCES", "EADDRINUSE"]);
      const onerror = (err: Error) => {
        if (
          "code" in err &&
          typeof err["code"] === "string" &&
          listenErrors.has(err.code)
        ) {
          deferred.reject(new Error("port in use"));
        }
      };
      const onlistening = () => {
        data.server.removeListener("error", onerror);
        data.server.removeListener("listening", onlistening);

        data.port = nonNull(port);
        deferred.resolve(port);
      };

      data.server.addListener("error", onerror);
      data.server.addListener("listening", onlistening);

      let deferred = await defer();
      let port: number | null = null;
      let successful = false;
      deferred.resolve(null);

      for (let i = 0; i < ports.length; i++) {
        deferred = await defer();
        port = nonNull(ports[i], "Invalid port. Port must be a number.");
        data.server.listen(port);

        await deferred.promise
          .then(() => (successful = true))
          .catch(() => (successful = false));
        if (successful) break;
      }

      if (successful) {
        data.listening = true;
        resolve(this);

        if (typeof callback === "function") {
          setImmediate(callback, this);
        }
      } else {
        reject(new Error("The server could not bind to any of the specified ports."));
      }

      return null;
    });
  }
}

export { Cafe };
export type { ICafe };
