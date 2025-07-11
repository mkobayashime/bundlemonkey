import * as v from "valibot";
import { describe, expect, it } from "vitest";
import type { Config } from "../../config";
import { type Meta, metaSchema } from "../../meta";
import { generateMetaHeader } from ".";

describe(generateMetaHeader, () => {
	it("generates meta header comment", () => {
		expect(
			generateMetaHeader({
				meta: v.parse(metaSchema, {
					name: "Test Script",
					version: "1.0.0",
					description: "test description",
					match: [],
					grant: "none",
				} satisfies Meta),
				defaultMeta: {},
				scriptName: "test-script",
			}),
		).toMatchInlineSnapshot(`
			"// ==UserScript==
			// @name         Test Script
			// @version      1.0.0
			// @description  test description
			// @grant        none
			// ==/UserScript=="
		`);

		expect(
			generateMetaHeader({
				meta: v.parse(metaSchema, {
					name: "",
					version: "",
				} satisfies Meta),
				defaultMeta: {},
				scriptName: "test-script",
			}),
		).toMatchInlineSnapshot(`
			"// ==UserScript==
			// @name
			// @version
			// ==/UserScript=="
		`);

		expect(
			generateMetaHeader({
				meta: v.parse(metaSchema, {
					name: "Test Script",
					namespace: "test-namespace",
					copyright: "copyright test script",
					version: "1.0.0",
					description: "test description",
					icon: "https://example.com/icon.png",
					grant: ["unsafeWindow", "GM.xmlHttpRequest"],
					author: "test-author",
					homepage: "https://example.com/userscripts",
					antiFeature: [
						{
							type: "ads",
							description: "We show you ads",
						},
						{
							type: "tracking",
							description: "We have some sort of analytics included",
						},
					],
					require: ["https://example.com/foo", "https://example.com/bar"],
					resource: [
						{
							name: "icon1",
							url: "http://www.tampermonkey.net/favicon.ico",
						},
						{
							name: "SRIsecured1",
							url: "http://www.tampermonkey.net/favicon.ico#md5=123434...",
						},
					],
					match: ["https://example.com/*", "https://foobar.example.com/*"],
					excludeMatch: [
						"https://example.com/exclude-match/*",
						"https://foobar.example.com/exclude-match/*",
					],
					include: [
						"https://example.com/include/*",
						"https://foobar.example.com/include/*",
					],
					exclude: [
						"https://example.com/exclude/*",
						"https://foobar.example.com/exclude/*",
					],
					runAt: "document-end",
					runIn: ["normal-tabs", "container-id-2"],
					sandbox: "JavaScript",
					injectInto: "page",
					tag: ["productivity"],
					connect: ["example.com", "localhost"],
					noframes: true,
					updateURL: "https://example.com/userscripts/test-script.user.js",
					downloadURL: "https://example.com/userscripts/test-script.user.js",
					supportURL: "https://example.com/userscripts/support",
					unwrap: true,
					topLevelAwait: true,
				} satisfies Meta),
				defaultMeta: {},
				scriptName: "test-script",
			}),
		).toMatchInlineSnapshot(`
			"// ==UserScript==
			// @name           Test Script
			// @namespace      test-namespace
			// @copyright      copyright test script
			// @version        1.0.0
			// @description    test description
			// @icon           https://example.com/icon.png
			// @grant          unsafeWindow
			// @grant          GM.xmlHttpRequest
			// @author         test-author
			// @homepage       https://example.com/userscripts
			// @homepageURL    https://example.com/userscripts
			// @antifeature    ads       We show you ads
			// @antifeature    tracking  We have some sort of analytics included
			// @require        https://example.com/foo
			// @require        https://example.com/bar
			// @resource       icon1  http://www.tampermonkey.net/favicon.ico
			// @resource       SRIsecured1  http://www.tampermonkey.net/favicon.ico#md5=123434...
			// @match          https://example.com/*
			// @match          https://foobar.example.com/*
			// @exclude-match  https://example.com/exclude-match/*
			// @exclude-match  https://foobar.example.com/exclude-match/*
			// @include        https://example.com/include/*
			// @include        https://foobar.example.com/include/*
			// @exclude        https://example.com/exclude/*
			// @exclude        https://foobar.example.com/exclude/*
			// @run-at         document-end
			// @run-in         normal-tabs
			// @run-in         container-id-2
			// @sandbox        JavaScript
			// @inject-into    page
			// @tag            productivity
			// @connect        example.com
			// @connect        localhost
			// @noframes
			// @updateURL      https://example.com/userscripts/test-script.user.js
			// @downloadURL    https://example.com/userscripts/test-script.user.js
			// @supportURL     https://example.com/userscripts/support
			// @unwrap
			// @topLevelAwait
			// ==/UserScript=="
		`);
	});

	it("respects defaultMeta", () => {
		const defaultMeta: Config["defaultMeta"] = {
			author: "test-author",
			namespace: "test-namespace",
			downloadURL: ({ scriptName, version }) =>
				`https://example.com/userscripts/${scriptName}-${version}.user.js`,
			updateURL: ({ scriptName, version }) =>
				`https://example.com/userscripts/${scriptName}-${version}.user.js`,
		};

		expect(
			generateMetaHeader({
				meta: v.parse(metaSchema, {
					name: "Test Script",
					version: "1.0.0",
					description: "test description",
					match: [],
				} satisfies Meta),
				defaultMeta: defaultMeta,
				scriptName: "test-script",
			}),
		).toMatchInlineSnapshot(`
			"// ==UserScript==
			// @name         Test Script
			// @namespace    test-namespace
			// @version      1.0.0
			// @description  test description
			// @author       test-author
			// @updateURL    https://example.com/userscripts/test-script-1.0.0.user.js
			// @downloadURL  https://example.com/userscripts/test-script-1.0.0.user.js
			// ==/UserScript=="
		`);
	});
});
