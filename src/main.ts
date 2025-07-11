import { mkdir } from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";
import * as esbuild from "esbuild";
import { glob } from "glob";
import { type Config, loadConfig, type ParsedConfig } from "./config/index.js";
import { type Mode, userscriptsPlugin } from "./plugin/index.js";

const defaultScriptName = (filepath: string): string => {
	const parsed = path.parse(filepath);

	// For legacy pattern: src/foo/index.user.ts -> "foo"
	if (parsed.name === "index.user") {
		return path.basename(path.dirname(filepath));
	}

	// For flat files: src/script.user.ts -> "script"
	if (parsed.name.endsWith(".user")) {
		return parsed.name.slice(0, -5); // remove .user
	}

	// Fallback: use full filename without extension
	return parsed.name;
};

const defaultOutputName = (_filepath: string, scriptName: string): string => {
	return `${scriptName}.user`;
};

const getEntryPoints = async (config: ParsedConfig) => {
	// Determine glob patterns to use
	let patterns: string[];

	if (config.sources?.glob) {
		// Use new sources.glob configuration
		patterns = Array.isArray(config.sources.glob)
			? config.sources.glob
			: [config.sources.glob];
	} else {
		// Use legacy srcDir configuration
		patterns = [path.resolve(config.srcDir, "./*/index.user.{j,t}s")];
	}

	// Get all matching files
	const allFiles = await Promise.all(patterns.map((pattern) => glob(pattern)));
	const filepaths = allFiles.flat();

	// Get naming functions
	const scriptNameFn = config.sources?.naming?.scriptName ?? defaultScriptName;
	const outputNameFn = config.sources?.naming?.outputName ?? defaultOutputName;

	return filepaths.map((filepath) => {
		const scriptName = scriptNameFn(filepath);
		const outputName = outputNameFn(filepath, scriptName);

		return {
			in: filepath,
			out: outputName,
			scriptName, // We'll use this separately, not pass to ESBuild
		};
	});
};

const getCommonOptions = ({
	entryPoint,
	defaultMeta,
	mode,
	onBuildEnd,
}: {
	entryPoint: {
		in: string;
		out: string;
		scriptName: string;
	};
	defaultMeta: ParsedConfig["defaultMeta"];
	mode: Mode;
	onBuildEnd?: (output: { path: string; content: string }) => void;
}): esbuild.BuildOptions => {
	const { scriptName } = entryPoint;

	return {
		entryPoints: [{ in: entryPoint.in, out: entryPoint.out }],
		bundle: true,
		write: false,
		charset: "utf8",
		format: "esm",
		legalComments: "inline",
		plugins: [
			userscriptsPlugin({
				defaultMeta,
				mode,
				scriptName,
				onBuildEnd,
			}),
		],
	};
};

export const build = async ({
	config,
}: {
	config?: Config;
}): Promise<
	Array<
		| {
				path: string;
				content: string;
		  }
		| undefined
	>
> => {
	console.log(styleText("blue", "Bundlemonkey started in production mode\n"));

	const loadedConfig = await loadConfig(config);

	const entryPoints = await getEntryPoints(loadedConfig);

	await mkdir(loadedConfig.dist.production, { recursive: true });

	return await Promise.all(
		entryPoints.map(async (entryPoint) => {
			let output: { path: string; content: string } | undefined;

			await esbuild.build({
				...getCommonOptions({
					entryPoint,
					defaultMeta: loadedConfig.defaultMeta,
					mode: "production",
					onBuildEnd: (c) => {
						output = c;
					},
				}),
				outdir: loadedConfig.dist.production,
			});

			return output;
		}),
	);
};

export const watch = async ({
	remote,
	config,
}: {
	remote: boolean;
	config?: Config;
}) => {
	console.log(
		styleText(
			"blue",
			`Bundlemonkey started in ${remote ? "remote watch" : "watch"} mode\n`,
		),
	);

	const loadedConfig = await loadConfig(config);

	const entryPoints = await getEntryPoints(loadedConfig);

	await mkdir(loadedConfig.dist.dev, { recursive: true });

	await Promise.all(
		entryPoints.map(async (entryPoint) => {
			const context = await esbuild.context({
				...getCommonOptions({
					entryPoint,
					defaultMeta: loadedConfig.defaultMeta,
					mode: remote ? "watchRemote" : "watch",
				}),
				outdir: loadedConfig.dist.dev,
			});

			await context.watch();
		}),
	);
};
