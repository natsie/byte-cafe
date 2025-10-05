import { type } from "arktype";
import { Cafe } from "./cafe.ts";
import type { AnyFunction } from "./types.ts";

const TCafe = type.instanceOf(Cafe);
const TFunction = type.unknown.narrow(
  (value): value is AnyFunction => typeof value === "function",
);

export const CafeListenArgs = type
  .or([TFunction.optional()])
  .or(["null | number | number[]", TFunction.optional()]);
