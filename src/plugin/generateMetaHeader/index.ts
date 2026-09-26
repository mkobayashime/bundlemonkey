import type { ParsedConfig } from "../../config";
import type { ParsedMeta } from "../../meta";

export const generateMetaHeader = ({
	meta,
	defaultMeta,
	scriptName,
}: {
	meta: ParsedMeta;
	defaultMeta: ParsedConfig["defaultMeta"];
	scriptName: string;
}) => {
	const updateURL = (() => {
		const generatedUpdateURL = defaultMeta.updateURL?.({
			scriptName,
			version: meta.version,
		});

		if (defaultMeta.updateURL) {
			if (typeof generatedUpdateURL === "string") {
				return generatedUpdateURL;
			}

			console.warn("Warning: `defaultMeta.updateURL` must return string value.");
		}

		return meta.updateURL;
	})();

	const downloadURL = (() => {
		const generatedDownloadURL = defaultMeta.downloadURL?.({
			scriptName,
			version: meta.version,
		});

		if (defaultMeta.downloadURL) {
			if (typeof generatedDownloadURL === "string") {
				return generatedDownloadURL;
			}

			console.warn("Warning: `defaultMeta.downloadURL` must return string value.");
		}

		return meta.downloadURL;
	})();

	const mergedMeta: ParsedMeta = {
		...defaultMeta,
		...meta,
		updateURL,
		downloadURL,
	};

	const tagPair = (
		key: string,
		value: string | boolean | undefined,
	): [string, string | true] | undefined =>
		value === undefined || value === false ? undefined : [key, value];

	const tags = [
		tagPair("name", mergedMeta.name),
		tagPair("namespace", mergedMeta.namespace ?? mergedMeta.author),
		tagPair("copyright", mergedMeta.copyright),
		tagPair("version", mergedMeta.version),
		tagPair("description", mergedMeta.description),
		tagPair("icon", mergedMeta.icon),
		...(mergedMeta.grant === "none"
			? [tagPair("grant", "none")]
			: mergedMeta.grant.map((v) => tagPair("grant", v))),
		tagPair("author", mergedMeta.author),
		tagPair("homepage", mergedMeta.homepage),
		tagPair("homepageURL", mergedMeta.homepage),
		...mergedMeta.antiFeature.map(({ type, description }) =>
			tagPair("antifeature", `${type.padEnd(8)}  ${description}`),
		),
		...mergedMeta.require.map((v) => tagPair("require", v)),
		...mergedMeta.resource.map(({ name, url }) => tagPair("resource", `${name}  ${url}`)),
		...mergedMeta.match.map((v) => tagPair("match", v)),
		...mergedMeta.excludeMatch.map((v) => tagPair("exclude-match", v)),
		...mergedMeta.include.map((v) => tagPair("include", v)),
		...mergedMeta.exclude.map((v) => tagPair("exclude", v)),
		tagPair("run-at", mergedMeta.runAt),
		...mergedMeta.runIn.map((v) => tagPair("run-in", v)),
		tagPair("sandbox", mergedMeta.sandbox),
		tagPair("inject-into", mergedMeta.injectInto),
		...mergedMeta.tag.map((v) => tagPair("tag", v)),
		...mergedMeta.connect.map((v) => tagPair("connect", v)),
		tagPair("noframes", mergedMeta.noframes),
		tagPair("updateURL", mergedMeta.updateURL),
		tagPair("downloadURL", mergedMeta.downloadURL),
		tagPair("supportURL", mergedMeta.supportURL),
		tagPair("unwrap", mergedMeta.unwrap),
		tagPair("topLevelAwait", mergedMeta.topLevelAwait),
	].filter((v) => v !== undefined);

	const tagNames = tags.map(([tagName]) => tagName);
	const longestTagNameLength = Math.max(...tagNames.map((tagName) => tagName.length));

	return [
		"// ==UserScript==",
		tags.flatMap(([key, value]) =>
			value === undefined
				? []
				: [`// @${key.padEnd(longestTagNameLength)}  ${value === true ? "" : value}`.trimEnd()],
		),
		"// ==/UserScript==",
	]
		.flat()
		.flatMap((s) => (s ? [s] : []))
		.join("\n");
};
