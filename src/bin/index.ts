#!/usr/bin/env node

import { existsSync } from "node:fs";
import { cp } from "node:fs/promises";
import path from "node:path";
import { parseArgs, styleText } from "node:util";

import { input } from "@inquirer/prompts";

import { build, watch } from "../main";

void (async () => {
	const { values } = parseArgs({
		args: process.argv.slice(2),
		options: {
			watch: {
				type: "boolean",
				short: "W",
				default: false,
			},
			remote: {
				type: "boolean",
				default: false,
			},
			create: {
				type: "boolean",
				default: false,
			},
		},
		allowPositionals: true,
	});

	if (values.create) {
		const projectDirname = await input({ message: "Project directory" });
		const projectPath = path.resolve(process.cwd(), projectDirname);

		if (existsSync(projectPath)) {
			console.error(
				styleText(["bgRed", "whiteBright"], " Error "),
				`Directory already exists: ${projectPath}`,
			);

			process.exit(1);
		}

		await cp(
			path.resolve(import.meta.dirname, "../../templates/template-typescript"),
			projectPath,
			{ recursive: true },
		);

		console.log(
			`
${styleText("green", `Successfully created project: ${projectDirname}`)}

Next steps:
  1. ${styleText("blueBright", `cd ${projectDirname}`)}
  2. ${styleText("blueBright", "[npm | pnpm | bun] install")}
  3. ${styleText("blueBright", "[npm | pnpm | bun] run build")}
`.trimRight(),
		);

		return;
	}

	const mode = values.watch ? (values.remote ? "watchRemote" : "watch") : "production";

	if (mode === "production") {
		await build({});
		return;
	}

	await watch({ remote: mode === "watchRemote" });
})();
