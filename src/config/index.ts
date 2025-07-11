import path from "node:path";
import { createJiti } from "jiti";
import type { OverrideProperties } from "type-fest";
import * as v from "valibot";
import { metaSchema } from "../meta";

const jiti = createJiti(import.meta.url);

const defaultMetaSchema = v.partial(
	v.object({
		...metaSchema.entries,
		updateURL: v.function(),
		downloadURL: v.function(),
	}),
);
type DefaultMeta = OverrideProperties<
	v.InferInput<typeof defaultMetaSchema>,
	{
		updateURL?: (args: { scriptName: string; version: string }) => string;
		downloadURL?: (args: { scriptName: string; version: string }) => string;
	}
>;

const sourcesSchema = v.object({
	glob: v.optional(v.union([v.string(), v.array(v.string())])),
	naming: v.optional(
		v.object({
			scriptName: v.optional(v.function()),
			outputName: v.optional(v.function()),
		}),
		{},
	),
});

export const configSchema = v.object({
	srcDir: v.optional(v.string(), "src"),
	sources: v.optional(sourcesSchema),
	dist: v.optional(
		v.object({
			production: v.optional(v.string(), "dist"),
			dev: v.optional(v.string(), ".dev"),
		}),
		{
			production: "dist",
			dev: ".dev",
		},
	),
	defaultMeta: v.optional(defaultMetaSchema, {}),
});
type Sources = {
	glob?: string | string[];
	naming?: {
		scriptName?: (filepath: string) => string;
		outputName?: (filepath: string, scriptName: string) => string;
	};
};

export type Config = OverrideProperties<
	v.InferInput<typeof configSchema>,
	{
		defaultMeta?: DefaultMeta;
		sources?: Sources;
	}
>;
export type ParsedConfig = OverrideProperties<
	v.InferOutput<typeof configSchema>,
	{
		sources?: Sources;
		defaultMeta: DefaultMeta;
	}
>;

export const loadConfig = async (
	config: Config = {},
): Promise<ParsedConfig> => {
	try {
		const loaded = await Promise.any(
			["bundlemonkey.config.ts", "bundlemonkey.config.js"].map(
				async (configFile) =>
					await jiti.import(path.resolve(process.cwd(), configFile), {
						default: true,
					}),
			),
		);
		v.assert(v.object({}), loaded);

		const parsed = v.parse(configSchema, { ...loaded, ...config });
		return parsed as ParsedConfig;
	} catch (_) {
		return v.parse(configSchema, config) as ParsedConfig;
	}
};
