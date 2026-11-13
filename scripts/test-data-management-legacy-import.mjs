import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../components/settings/data-management.tsx", import.meta.url), "utf8");

// Old momo backups can contain module ids removed from newer forks (for example
// the former "favorites" module). Rendering MODULE_ICONS[id] directly produced
// React error #130 because the icon component was undefined.
assert.match(source, /MODULE_ICONS\[item\.id\] \?\? Archive/, "unknown legacy modules must fall back to a real icon");
assert.match(source, /MODULE_ACCENTS\[item\.id\] \?\? BINDING_ACCENTS\.regex/, "unknown legacy modules must fall back to a real accent");
assert.match(source, /\.filter\(\(module\) => ALL_MODULE_IDS\.includes\(module\.id\)\)/, "unsupported modules must be filtered before rendering");
assert.match(source, /unsupportedModules/, "legacy module ids must be reported instead of crashing");
assert.match(source, /已跳过当前版本不支持的旧模块/, "the user must receive a clear skipped-module notice");

console.log("Legacy data-import regression checks passed.");
