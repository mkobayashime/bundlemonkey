import path from "node:path";

import { describe, expect, it } from "vitest";

import { extractMain } from "../";

describe(extractMain, () => {
	it("extracts `main` in arrow function format from the `defineUserscript`", async () => {
		const output = await extractMain(
			path.resolve(import.meta.dirname, "./scripts/arrowFunctionMain.ts"),
		);

		expect(output).toMatchInlineSnapshot(`
			"import { defineUserScript } from "../../../..";
			import { message } from "./module";
			/**
			 * top-level statements
			 */
			const foo = "bar";
			console.log(foo);

			const userscriptConfig = {
					/**
					 * @type string
					 */
					foo: "bar",
				}

			void (({ foo }) => {
					/**
					 * output imported message
					 */
					console.log(message);

					// output config
					console.log(foo);
				})(userscriptConfig);"
		`);
	});

	it("extracts async `main` function as well", async () => {
		const output = await extractMain(path.resolve(import.meta.dirname, "./scripts/asyncMain.ts"));

		expect(output).toMatchInlineSnapshot(`
			"import { defineUserScript } from "../../../..";

			void (async () => {
					await new Promise((resolve) => globalThis.setTimeout(resolve, 1000));
				})();"
		`);
	});

	it("extracts `main` as a function expression as well", async () => {
		const output = await extractMain(
			path.resolve(import.meta.dirname, "./scripts/functionMain.ts"),
		);

		expect(output).toMatchInlineSnapshot(`
			"import { defineUserScript } from "../../../..";
			import { message } from "./module";

			void (function () {
					console.log(message);
				})();"
		`);
	});

	it("extracts `main` in method definition as well", async () => {
		const output = await extractMain(path.resolve(import.meta.dirname, "./scripts/methodMain.ts"));

		expect(output).toMatchInlineSnapshot(`
			"import { defineUserScript } from "../../../..";
			import { message } from "./module";

			void (function () {
			    console.log(message);
			})();"
		`);
	});

	it("works for `*.js` files as well", async () => {
		const output = await extractMain(path.resolve(import.meta.dirname, "./scripts/inJS.js"));

		expect(output).toMatchInlineSnapshot(`
			"import { defineUserScript } from "../../../..";

			void (() => {
					console.log("hello from js");
				})();"
		`);
	});
});
