import path from "node:path";
import { describe, expect, test } from "vitest";
import { build } from "../src";

describe("E2E", async () => {
	// eslint-disable-next-line @typescript-eslint/unbound-method
	const originalConsoleLog = globalThis.console.log;

	globalThis.console.log = () => {};

	const outputs = await build({
		config: {
			srcDir: path.resolve(import.meta.dirname, "src"),
			dist: {
				production: path.resolve(import.meta.dirname, ".dist"),
			},
		},
	});

	globalThis.console.log = originalConsoleLog;

	for (const output of outputs.filter((o) => o !== undefined)) {
		const basename = path.basename(output.path);
		test(basename, async () => {
			await expect(output.content).toMatchFileSnapshot(
				path.resolve(import.meta.dirname, "snapshots", basename),
			);
		});
	}
});
