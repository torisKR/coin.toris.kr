import path from "node:path";
import { stat } from "node:fs/promises";
import { loadAndParseConfig } from "@cloudflare/config";
import {
  cleanBuildOutputDir,
  writeAssets,
  writeRootConfig,
  writeWorkerConfig,
  readBuildOutput,
} from "@cloudflare/build-output-utils";
const root = process.cwd();
await stat(path.join(root, "out/index.html"));
const context = { isPreview: false, mode: "production" };
const loaded = await loadAndParseConfig(
  path.join(root, "cloudflare.config.ts"),
  context,
);
if (!loaded.result.success) throw new Error(loaded.result.error.message);
const config = loaded.result.data;
if (!config.worker)
  throw new Error("Cloudflare worker configuration is missing");
await cleanBuildOutputDir(root);
await writeRootConfig(root, { accountId: config.accountId }, context);
await writeWorkerConfig({ root, config: config.worker });
await writeAssets({ root, sourceDirectory: path.join(root, "out") });
const output = await readBuildOutput(root);
console.log(
  `Prepared ${output.workers.default.config.name} with static HTML and assets. No server secrets are included.`,
);
