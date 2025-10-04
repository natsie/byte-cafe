import { type } from "arktype";
import { Cafe } from "./cafe.ts";
import type { AnyFunction } from "./types.ts";

const TFunction = type.unknown.narrow(
  (value): value is AnyFunction => typeof value === "function",
);
const TCafe = type.instanceOf(Cafe);
const ListenCallback = type.unknown.narrow(
  (value): value is (cafe: Cafe) => void => typeof value === "function",
);

export const Arguments = {
  "Cafe#listen": type
    .or([ListenCallback.optional()])
    .or(["null | number | number[]", ListenCallback.optional()]),
};
