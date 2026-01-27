import { typescriptWithBiome } from "@mkobayashime/shared-config/eslint";

export default [
	{
		ignores: [
			".tsup",
			"dist",
			"templates",
			"test/src",
			"test/snapshots",
			"test/.dist",
		],
	},
	...typescriptWithBiome,
	{
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json",
			},
		},
	},
];
