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

export const configSchema = v.object({
	srcDir: v.optional(v.string(), "src"),
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
export type Config = OverrideProperties<
	v.InferInput<typeof configSchema>,
	{ defaultMeta?: DefaultMeta }
>;
export type ParsedConfig = v.InferOutput<typeof configSchema>;

export const loadConfig = async (config: Config = {}) => {
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
		return parsed;
	} catch {
		return v.parse(configSchema, config);
	}
};
