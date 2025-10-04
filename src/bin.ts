import { resolve } from "node:path";
import { Cafe } from "./cafe.ts";
import { argv, cwd } from "node:process";

const args = argv.slice(2);
const cafe1 = new Cafe({
  basePath: args[0] == null ? cwd() : resolve(args[0]),
  port: args[1] == null ? 3333 : ~~args[1] || 8080,
});

cafe1.listen(null, () => {
  console.log(`A new cafe sprung up at ${cafe1.port}`);
});
