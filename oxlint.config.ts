import { defineConfig } from "oxlint";

export default defineConfig({
	categories: {
		correctness: "error",
	},
	options: {
		typeAware: true,
	},
	rules: {},
	env: {
		builtin: true,
	},
	ignorePatterns: ["src/**/test/source/**", "templates/**", "test/src/**", "test/snapshots/**"],
});
