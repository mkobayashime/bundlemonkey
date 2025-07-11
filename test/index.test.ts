import path from "node:path";
import { describe, expect, test } from "vitest";
import { build } from "../src";

describe("E2E", async () => {
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

describe("E2E with sources.glob", async () => {
	const originalConsoleLog = globalThis.console.log;

	globalThis.console.log = () => {};

	const outputs = await build({
		config: {
			sources: {
				glob: path.resolve(import.meta.dirname, "src/*/index.user.{ts,js}"),
			},
			dist: {
				production: path.resolve(import.meta.dirname, ".dist-sources"),
			},
		},
	});

	globalThis.console.log = originalConsoleLog;

	test("should produce same outputs as legacy srcDir", () => {
		expect(outputs.length).toBeGreaterThan(0);
		for (const output of outputs.filter((o) => o !== undefined)) {
			expect(output.content).toContain("// ==UserScript==");
			expect(output.content).toContain("// ==/UserScript==");
		}
	});
});
