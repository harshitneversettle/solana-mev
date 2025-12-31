import dotenv from "dotenv";
import monitor from "./monitor.js";
import discoverPools from "./discoverPools.js";
dotenv.config();
async function main() {
    await discoverPools();
    await monitor();
}
main();
//# sourceMappingURL=index.js.map