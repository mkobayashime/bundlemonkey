import * as v from "valibot";
import { describe, expect, test } from "vitest";

import { metaSchema } from ".";

describe("metaSchema", () => {
	test("parse meta successfully", () => {
		expect(
			v.parse(metaSchema, {
				name: "Test Script",
				version: "1.0.0",
			}),
		).toEqual({
			name: "Test Script",
			version: "1.0.0",
			antiFeature: [],
			connect: [],
			exclude: [],
			excludeMatch: [],
			grant: [],
			include: [],
			match: [],
			noframes: false,
			require: [],
			resource: [],
			runIn: [],
			tag: [],
			topLevelAwait: false,
			unwrap: false,
		});

		expect(
			v.parse(metaSchema, {
				name: "Test Script",
				namespace: "test-namespace",
				copyright: "copyright test script",
				version: "1.0.0",
				description: "test description",
				icon: "https://example.com/icon.png",
				grant: ["unsafeWindow"],
				author: "test-author",
				homepage: "https://example.com/userscripts",
				antiFeature: [
					{
						type: "tracking",
						description: "We have some sort of analytics included",
					},
				],
				require: ["https://example.com/foo"],
				resource: [
					{
						name: "icon1",
						url: "http://www.tampermonkey.net/favicon.ico",
					},
				],
				match: ["https://foobar.example.com/*"],
				excludeMatch: ["https://example.com/exclude-match/*"],
				include: ["https://example.com/include/*"],
				exclude: ["https://example.com/exclude/*"],
				runAt: "document-end",
				runIn: ["normal-tabs"],
				sandbox: "JavaScript",
				injectInto: "page",
				tag: ["productivity"],
				connect: ["example.com"],
				noframes: true,
				updateURL: "https://example.com/userscripts/test-script.user.js",
				downloadURL: "https://example.com/userscripts/test-script.user.js",
				supportURL: "https://example.com/userscripts/support",
				unwrap: true,
				topLevelAwait: true,
			}),
		).toEqual({
			antiFeature: [
				{
					description: "We have some sort of analytics included",
					type: "tracking",
				},
			],
			author: "test-author",
			connect: ["example.com"],
			copyright: "copyright test script",
			description: "test description",
			downloadURL: "https://example.com/userscripts/test-script.user.js",
			exclude: ["https://example.com/exclude/*"],
			excludeMatch: ["https://example.com/exclude-match/*"],
			grant: ["unsafeWindow"],
			homepage: "https://example.com/userscripts",
			icon: "https://example.com/icon.png",
			include: ["https://example.com/include/*"],
			injectInto: "page",
			match: ["https://foobar.example.com/*"],
			name: "Test Script",
			namespace: "test-namespace",
			noframes: true,
			require: ["https://example.com/foo"],
			resource: [
				{
					name: "icon1",
					url: "http://www.tampermonkey.net/favicon.ico",
				},
			],
			runAt: "document-end",
			runIn: ["normal-tabs"],
			sandbox: "JavaScript",
			supportURL: "https://example.com/userscripts/support",
			tag: ["productivity"],
			topLevelAwait: true,
			unwrap: true,
			updateURL: "https://example.com/userscripts/test-script.user.js",
			version: "1.0.0",
		});
	});

	test("show error messages for missing required props", () => {
		const { issues } = v.safeParse(metaSchema, {});

		expect(issues ? v.flatten(issues).nested : undefined).toEqual({
			name: ['"name" is required'],
			version: ['"version" is required'],
		});
	});

	test("show error messages for props in a wrong type", () => {
		const { issues } = v.safeParse(metaSchema, {
			name: 1,
			version: null,
			grant: 1,
			include: "foo",
		});

		expect(issues ? v.flatten(issues).nested : undefined).toEqual({
			name: ["Invalid type: Expected string but received 1"],
			version: ["Invalid type: Expected string but received null"],
			grant: ['Invalid type: Expected (Array | "none") but received 1'],
			include: ['Invalid type: Expected Array but received "foo"'],
		});
	});
});
