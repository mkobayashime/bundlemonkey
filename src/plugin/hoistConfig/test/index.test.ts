import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { hoistConfig } from "..";

describe(hoistConfig, () => {
	it("hoists config lines", async () => {
		const output = hoistConfig(
			(await readFile(path.resolve(import.meta.dirname, "./source/hasConfig.js"))).toString(),
		);

		expect(output).toMatchInlineSnapshot(`
			"var userscriptConfig = {
				/**
				 * @type string
				 */
				message: "world",
			};

			console.log("hello");


			void (({ message }) => {
				console.log(message);
			})(userscriptConfig);"
		`);
	});

	it("returns the source as is if it doesn't have config", async () => {
		const output = hoistConfig(
			(await readFile(path.resolve(import.meta.dirname, "./source/noConfig.js"))).toString(),
		);

		expect(output).toMatchInlineSnapshot(`
			"console.log("hello");

			void (() => {
				console.log("world");
			})();
			"
		`);
	});
});
