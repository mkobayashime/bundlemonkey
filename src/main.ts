import { mkdir } from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";
import * as esbuild from "esbuild";
import { glob } from "glob";
import { loadConfig } from "./config/index.js";
import { type Mode, userscriptsPlugin } from "./plugin/index.js";

export const main = async ({ mode }: { mode: Mode }) => {
	const config = await loadConfig();

	const entryPoints = (
		await glob(path.resolve(config.srcDir, "./*/index.user.{j,t}s"))
	).map((filepath) => ({
		out: `${path.basename(path.dirname(filepath))}.user`,
		in: filepath,
	}));

	const getCommonOptions = (): esbuild.BuildOptions => ({
		bundle: true,
		write: false,
		charset: "utf8",
		format: "esm",
		legalComments: "inline",
		plugins: [
			userscriptsPlugin({
				mode,
				defaultMeta: config.defaultMeta,
			}),
		],
	});

	console.log(styleText("blue", `Bundlemonkey started in ${mode} mode\n`));

	switch (mode) {
		case "watch":
		case "watchRemote": {
			await mkdir(config.dist.dev, { recursive: true });

			await Promise.all(
				entryPoints.map(async (entrypoint) => {
					const context = await esbuild.context({
						...getCommonOptions(),
						entryPoints: [entrypoint],
						outdir: config.dist.dev,
					});

					await context.watch();
				}),
			);
			break;
		}
		case "production": {
			await mkdir(config.dist.production, { recursive: true });

			await Promise.all(
				entryPoints.map(async (entrypoint) => {
					await esbuild.build({
						...getCommonOptions(),
						entryPoints: [entrypoint],
						outdir: config.dist.production,
					});
				}),
			);
			break;
		}
		default: {
			mode satisfies never;
		}
	}
};
