import type { IncomingMessage, Server, ServerResponse } from "node:http";
import type { Cafe } from "./cafe.ts";

export type AnyFunction = (...args: unknown[]) => unknown;

namespace ICafe {
  export interface AliasMap {
    [x: string]: string | ((request: IncomingMessage) => Response);
  }

  export interface Config {
    alias: Record<string, string[]>;
    basePath: string;
    menu: ICafe.Menu;
    parsePresets: boolean;
    port: number;
    serveDirectories: boolean;
  }

  export type Data = ICafe.InternalData & ICafe.Config;

  export interface InternalData {
    server: Server;
    listening: boolean;
  }

  export interface Menu {
    include: string[];
    exclude: string[];
  }

  export namespace Server {
    export interface CustomerOrderData {
      data: ICafe.Data;
      resolvedPath: string;
      request: IncomingMessage;
      response: ServerResponse;
      url: URL;
    }

    export type RequestListener = (
      req: IncomingMessage,
      res: ServerResponse,
    ) => Promise<null>;
  }

  export interface UserConfig {
    alias?: Record<string, string[]>;
    basePath?: string;
    menu?: Partial<ICafe.Menu>;
    parsePresets?: boolean;
    port?: number;
    serveDirectories?: boolean;
  }

  export namespace Internal {
    export type ListenPortSpec = number | number[] | null;
    export type ListenCallback = (cafe: Cafe) => void;
    export type ListenArgs =
      | [(ListenPortSpec | ListenCallback)?]
      | [ListenPortSpec, ListenCallback?];
  }
}

export type { ICafe };
