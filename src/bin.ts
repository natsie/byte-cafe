#!/usr/bin/env node
import { resolve } from "node:path";
import { argv, cwd } from "node:process";
import { Cafe } from "./cafe.ts";

const args = argv.slice(2);
const cafe = new Cafe({
  basePath: args[0] == null ? cwd() : resolve(args[0]),
  port: args[1] == null ? 3333 : ~~args[1] || 8080,
});

cafe.listen(null, ({ port }) => {
  console.log(`A new cafe sprung up at ${port}`);
});
