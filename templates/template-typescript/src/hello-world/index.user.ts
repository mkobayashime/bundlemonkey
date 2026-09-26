import { defineUserScript } from "bundlemonkey";

import { message } from "./message.js";

export default defineUserScript({
	name: "Hello world",
	version: "0.1.0",
	description: "Hello from Bundlemonkey!",
	match: ["https://example.com/*"],
	main: () => {
		window.alert(message);
	},
});
