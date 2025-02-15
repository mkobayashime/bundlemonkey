import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractMain } from "../";

describe(extractMain, () => {
	it("extracts `main` in arrow function format from the `defineUserscript`", async () => {
		const output = await extractMain(
			path.resolve(import.meta.dirname, "./scripts/arrowFunctionMain.ts"),
		);

		expect(output).toMatchInlineSnapshot(`
			"import { defineUserScript } from "../../..";
			import { message } from "./module";

			void (() => {
					// @preserve scriptConfig
					const config = {
						foo: "bar",
					};

					console.log(message);

					void (({ foo }) => {
						console.log(foo);
					})(config);
				})();
			"
		`);
	});

	it("extracts `main` as a function expression as well", async () => {
		const output = await extractMain(
			path.resolve(import.meta.dirname, "./scripts/functionMain.ts"),
		);

		expect(output).toMatchInlineSnapshot(`
			"import { defineUserScript } from "../../..";
			import { message } from "./module";

			void (function () {
					console.log(message);
				})();
			"
		`);
	});

	it("extracts `main` in method definition as well", async () => {
		const output = await extractMain(
			path.resolve(import.meta.dirname, "./scripts/methodMain.ts"),
		);

		expect(output).toMatchInlineSnapshot(`
			"import { defineUserScript } from "../../..";
			import { message } from "./module";

			void (function () {
			    console.log(message);
			})();
			"
		`);
	});

	it("works for `*.js` files as well", async () => {
		const output = await extractMain(
			path.resolve(import.meta.dirname, "./scripts/inJS.js"),
		);

		expect(output).toMatchInlineSnapshot(`
			"import { defineUserScript } from "../../..";

			void (() => {
					console.log("hello from js");
				})();
			"
		`);
	});
});
