import { defineConfig } from "oxfmt";

export default defineConfig({
	useTabs: true,
	sortImports: true,
	ignorePatterns: ["src/**/test/source/**", "test/snapshots/**"],
	overrides: [
		{
			files: ["*.md"],
			options: {
				useTabs: false,
			},
		},
	],
});
