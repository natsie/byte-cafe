import type { Cafe } from "./cafe.ts";
import type { ICafe } from "./types.ts";
import { nonNull } from "./utils.ts";

import { open, type FileHandle } from "node:fs/promises";
import { extname, matchesGlob, resolve } from "node:path";

const extensionMap = (
  await import("./mime-types/ext-map.json", { with: { type: "json" } })
).default as Record<string, string>;

export const cafeData: Map<Cafe, ICafe.Data> = new Map();
export const getCafeData = (cafe: Cafe): ICafe.Data => nonNull(cafeData.get(cafe));
export const registerCafe = (cafe: Cafe, data: ICafe.Data) => {
  cafeData.set(cafe, data);
  data.server.addListener("request", createRequestListener(cafe, data));
  return null;
};

export const createRequestListener = (
  instance: Cafe,
  data?: ICafe.Data,
): ICafe.Server.RequestListener => {
  const _data =
    data ||
    nonNull(
      cafeData.get(instance),
      "Cafe data map yielded a nullish value for the specified instance.",
    );
  return async (request, response) => {
    let handle: FileHandle | null = null;
    response.setHeader("Served-Humbly-By", "Cafe");

    try {
      const url = new URL(request.url || "/", "http://[::1]");
      const path = url.pathname.slice(1, -+url.pathname.endsWith("/") || undefined);
      const resolvedPath = resolve(_data.basePath, path);

      handle = await open(resolvedPath);
      const handleStats = await handle.stat();

      const order = {
        data: _data,
        url,
        resolvedPath,
        request,
        response,
      };

      if (handleStats.isDirectory()) await serveDirectory(order);
      else if (handleStats.isFile()) await serveFile(order);
      else throw new Error("Unsupported handle type.");
    } catch (error) {
      const err = error as any;

      if (err.code === "ENOENT") {
        response.writeHead(400, "Not found");
        response.end("This cafe doesn't serve the requested resource.\n");
      } else {
        response.writeHead(500, "Internal server error.");
        response.end();
      }
    } finally {
      handle?.close();
    }
    return null;
  };
};

const serveFile = async (order: ICafe.Server.CustomerOrderData): Promise<null> => {
  const { data, url, resolvedPath, response } = order;
  const { basePath, menu } = data;

  const path = url.pathname.slice(1);
  const included = menu.include.some((pattern) => matchesGlob(path, pattern));
  const excluded = menu.exclude.some((pattern) => matchesGlob(path, pattern));

  if (excluded || !included || !resolvedPath.startsWith(basePath)) {
    response.writeHead(404, "Not found.");
    response.end("This cafe doesn't serve the requested resource.\n");
    return null;
  }

  try {
    const handle = await open(resolvedPath);
    const stats = await handle.stat();
    const readStream = handle.createReadStream();
    const headers = {
      "content-length": stats.size,
      "content-type":
        extensionMap[extname(resolvedPath).slice(1)] || "application/octet-stream",
    };

    response.writeHead(200, "Successful", headers);
    readStream.pipe(response, { end: true });

    response.on("error", () => handle.close());
    response.on("finish", () => handle.close());
  } catch (error) {
    const err = error as any;

    if (err.code === "ENOENT") {
      response.writeHead(404, "Not found");
      response.end("This cafe doesn't serve the requested resource.\n");
    } else {
      response.writeHead(500, "Internal cafe error.");
      response.end("The ran into an unexpected situation at the cafe.\n");
    }
  }

  return null;
};

const serveDirectory = async (order: ICafe.Server.CustomerOrderData): Promise<null> => {
  const { data, url, resolvedPath, response } = order;
  const { basePath, menu, serveDirectories } = data;

  const path = url.pathname.slice(1);
  const included = menu.include.some((pattern) => matchesGlob(path, pattern));
  const excluded = menu.exclude.some((pattern) => matchesGlob(path, pattern));

  if (excluded || !included || !resolvedPath.startsWith(basePath)) {
    response.writeHead(404, "Not found.");
    response.end("This cafe doesn't serve the requested resource.\n");
    return null;
  }

  if (serveDirectories) {
    response.writeHead(500, "Not implemented");
    response.end("This cafe doesn't handle such orders... yet.");
  } else {
    order.url.pathname += "/index.html";
    order.resolvedPath = resolve(resolvedPath, "index.html");
    await serveFile(order);
  }
  return null;
};
