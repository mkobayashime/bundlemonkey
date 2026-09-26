import { defineUserScript } from "../../../src";

export default defineUserScript({
	name: "MDN - Force English",
	version: "1.0.2",
	description: "Redirect Japanese pages in MDN to corresponding English pages",
	match: ["https://developer.mozilla.org/ja/docs/*"],
	icon: "https://www.google.com/s2/favicons?domain=developer.mozilla.org",
	main: () => {
		if (window.location.href.startsWith("https://developer.mozilla.org/ja/docs/")) {
			window.location.href = window.location.href.replace(
				/^https:\/\/developer.mozilla.org\/ja\/docs\//,
				"https://developer.mozilla.org/en-US/docs/",
			);
		}
	},
});
