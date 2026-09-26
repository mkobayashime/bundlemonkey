import { writeFile } from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";

import clipboard from "clipboardy";
import type * as esbuild from "esbuild";
import { createJiti } from "jiti";
import * as v from "valibot";

import type { ParsedConfig } from "../config";
import { metaSchema, type ParsedMeta } from "../meta";
import { extractMain } from "./extractMain";
import { generateMetaHeader } from "./generateMetaHeader";
import { hoistConfig } from "./hoistConfig";

export type Mode = "production" | "watch" | "watchRemote";

const jiti = createJiti(import.meta.url, { moduleCache: false });

export const userscriptsPlugin = ({
	defaultMeta,
	mode,
	scriptName,
	onBuildEnd = () => {},
}: {
	defaultMeta: ParsedConfig["defaultMeta"];
	mode: Mode;
	scriptName: string;
	onBuildEnd: ((output: { path: string; content: string }) => void) | undefined;
}): esbuild.Plugin => {
	const metaStore: Record<string, ParsedMeta | null> = {};

	let initialBundleFinished = false;
	let remoteModeScriptBundleFinished = false;

	return {
		name: "userscripts",
		setup: (build) => {
			build.onLoad({ filter: /\.user\.(t|j)s$/ }, async (args) => {
				try {
					const sourceWithMainExtracted = await extractMain(args.path);

					const imported = await jiti.import(path.resolve(process.cwd(), args.path), {
						default: true,
					});

					const parsedMeta = v.safeParse(metaSchema, imported);

					if (parsedMeta.issues) {
						metaStore[scriptName] = null;

						const issues = v.flatten(parsedMeta.issues);

						console.error(
							styleText(["bgRed", "whiteBright"], " Error "),
							styleText("reset", `Invalid meta for script: ${scriptName}`),
						);

						console.group();
						for (const [key, value] of Object.entries(issues.nested ?? {})) {
							for (const message of value ?? []) {
								console.error(styleText("reset", `${key}: ${message}`));
							}
						}
						console.groupEnd();
					} else {
						metaStore[scriptName] = parsedMeta.output;
					}

					return {
						contents: sourceWithMainExtracted,
						loader: "ts",
					};
				} catch (err) {
					metaStore[scriptName] = null;

					console.error(
						styleText(["bgRed", "whiteBright"], " Error "),
						styleText("reset", `Invalid script: ${scriptName}`),
					);

					console.group();
					console.error(styleText("reset", err instanceof Error ? err.message : String(err)));
					console.groupEnd();

					return {
						contents: "",
						loader: "ts",
					};
				}
			});

			build.onEnd(async (result) => {
				for (const file of result.outputFiles ?? []) {
					const meta = metaStore[scriptName];

					if (meta === null) {
						if (mode === "production") {
							throw new Error(`Failed to bundle script: ${scriptName}`);
						}

						return;
					}

					if (!meta) {
						throw new Error(`Failed to get meta for script: ${scriptName}`);
					}

					const metaHeader = generateMetaHeader({
						meta,
						defaultMeta,
						scriptName,
					});

					const finalCode = `${metaHeader}\n\n${hoistConfig(file.text)}`;

					switch (mode) {
						case "production": {
							await writeFile(file.path, finalCode);
							onBuildEnd({ path: file.path, content: finalCode });

							console.log(styleText("green", `Bundled ${scriptName}`));

							break;
						}
						case "watch":
						case "watchRemote": {
							if (!initialBundleFinished) {
								initialBundleFinished = true;
								break;
							}

							if (mode === "watchRemote" && !remoteModeScriptBundleFinished) {
								const remoteModeScript = generateMetaHeader({
									meta: {
										...meta,
										require: [...(meta.require ?? []), `file://${file.path}`],
									},
									defaultMeta,
									scriptName,
								});

								await clipboard.write(remoteModeScript);
								console.log(styleText("green", `Copied remote mode script for ${scriptName}\n`));

								remoteModeScriptBundleFinished = true;
							}

							await writeFile(file.path, finalCode);

							if (mode === "watch") {
								await clipboard.write(finalCode);
							}

							console.log(styleText("green", `Bundled ${scriptName}`));

							break;
						}
						default: {
							mode satisfies never;
						}
					}
				}
			});
		},
	};
};
