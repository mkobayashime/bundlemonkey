import { defineUserScript } from "../../../src";

export default defineUserScript({
	name: "Moneytree shortcut keys",
	version: "1.3.3",
	description: "Moneytree にショートカットキーを追加します",
	match: ["https://app.getmoneytree.com/*"],
	runAt: "document-end",
	icon: "https://www.google.com/s2/favicons?domain=getmoneytree.com",
	main: () => {
		document.onkeypress = (e) => {
			if (e.ctrlKey && e.code === "Enter") {
				const saveBtnInner = document.getElementsByClassName("modal-header-done-text")[0];
				if (saveBtnInner) {
					saveBtnInner.parentElement?.click();
				}
			}
		};

		document.onkeyup = (e) => {
			if (e.key === "Escape") {
				const cancelBtnInner = document.getElementsByClassName("modal-header-back-text")[0];
				if (cancelBtnInner) {
					cancelBtnInner.parentElement?.click();
				}
			}
		};
	},
});
