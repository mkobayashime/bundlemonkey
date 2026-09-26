import { writeFile } from "node:fs/promises";
import path from "node:path";

import { select } from "@inquirer/prompts";
import { $ } from "bun";
import { glob } from "glob";
import { inc } from "semver";

import { version as currentVersion } from "../package.json";

const bumpedVersionOptions = [
	inc(currentVersion, "patch"),
	inc(currentVersion, "minor"),
	inc(currentVersion, "major"),
].filter((v) => v !== null);

const bumpedVersion = await select({
	message: `${currentVersion} ->`,
	choices: bumpedVersionOptions.map((version) => ({
		name: version,
		value: version,
	})),
});

{
	const packageJson = { ...(await import("../package.json")).default };

	packageJson.version = bumpedVersion;

	await writeFile(
		path.resolve(import.meta.dirname, "../package.json"),
		JSON.stringify(packageJson, null, 2),
	);
}

{
	const templatePackageJsons = await glob(
		path.resolve(import.meta.dirname, "../templates/*/package.json"),
	);

	for (const packageJsonPath of templatePackageJsons) {
		const packageJson = {
			...(
				(await import(packageJsonPath)) as {
					default: { dependencies: { bundlemonkey: string } };
				}
			).default,
		};

		packageJson.dependencies.bundlemonkey = `^${bumpedVersion}`;

		await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
	}
}

await $`make lint.fix`;
await $`git checkout -B v${bumpedVersion}`;
await $`git add package.json templates/*/package.json`;
await $`git commit --message v${bumpedVersion}`;
