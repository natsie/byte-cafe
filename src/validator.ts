import type { ICafe } from "./types.ts";

export const v = {
  "Cafe#listen:Args": (value: unknown): ICafe.Internal.ListenArgs => {
    if (!Array.isArray(value)) throw new TypeError("Value must be an array.");
    if (value.length === 0) return value as [];
    if (value.length === 1) {
      const data = value[0];
      switch (typeof data) {
        case "number":
          if (Number.isSafeInteger(data)) return value as [number];
          throw new TypeError("A valid port must be a safe integer.");

        case "object":
          if (data === null) return value as [null];
          if (Array.isArray(data) && data.every(Number.isSafeInteger)) {
            return value as [number[]];
          }
        case "function":
          return value as [ICafe.Internal.ListenCallback];
      }

      throw new TypeError(
        "The first argument must be a safe integer or array of such, null, or a callback function.",
      );
    }
    if (value.length === 2) {
      const [port, callback] = value;
      const portIsValid =
        port === null ||
        Number.isSafeInteger(port) ||
        (Array.isArray(port) && port.every(Number.isSafeInteger));
      const callbackIsValid = callback == null || typeof callback === "function";

      if (!portIsValid) {
        throw new TypeError(
          "Invalid port specifier. The port specifier must be safe integer or array of such, or null.",
        );
      }
      if (!callbackIsValid) {
        throw new TypeError(
          "Invalid callback. Callback must be a function or nullish value.",
        );
      }

      return value as [ICafe.Internal.ListenPortSpec, ICafe.Internal.ListenCallback?];
    }

    throw new TypeError(
      `Too many arguments. Expected zero, one, or two arguments. Received ${value.length}.`,
    );
  },
};
