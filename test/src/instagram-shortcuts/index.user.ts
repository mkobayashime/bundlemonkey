import { defineUserScript } from "../../../src";
import { isTyping } from "../utils/isTyping.js";

export default defineUserScript({
	name: "Instagram - Shortcut keys",
	version: "2.2.4",
	description: "Space key to like, arrow/h/l keys to next/previous photo in the post",
	match: ["https://www.instagram.com/*"],
	icon: "https://www.google.com/s2/favicons?domain=instagram.com",
	runAt: "document-end",
	config: {
		/**
		 * Whether pressing Space on already liked post unlikes it or not.
		 * Defaults to `false` to keep it consistent with the double tapping in mobile app.
		 * @default false
		 */
		UNLIKE: false,
	},
	main: ({ UNLIKE }) => {
		const getTargetPost = () => {
			if (window.location.href.startsWith("https://www.instagram.com/p/")) {
				return document.querySelector("main");
			}

			const postWrappers = Array.from(document.querySelectorAll("article"));

			if (postWrappers.length === 1) return postWrappers[0];

			return postWrappers.find((element) => {
				const windowHalfHeight = window.innerHeight / 2;
				const { top, height } = element.getBoundingClientRect();

				return top <= windowHalfHeight && top + height >= windowHalfHeight;
			});
		};

		window.document.documentElement.addEventListener("keydown", (e) => {
			if (isTyping()) return;

			if (e.code === "Space") {
				const targetPost = getTargetPost();
				if (!targetPost) return;

				const likeButtonSvg = targetPost.querySelector<HTMLElement>(
					"[aria-label='Like'], [aria-label='いいね！']",
				);
				const unlikeButtonSvg = targetPost.querySelector<HTMLElement>(
					"[aria-label='Unlike'], [aria-label='「いいね！」を取り消す']",
				);

				const buttonSvgToClick = unlikeButtonSvg ?? likeButtonSvg;
				if (!buttonSvgToClick) return;

				e.preventDefault();
				e.stopImmediatePropagation();

				if (!UNLIKE && unlikeButtonSvg) return;

				buttonSvgToClick.parentElement?.click();
			}

			if (e.key === "l" || e.key === "ArrowRight") {
				const post = getTargetPost();
				if (!post) return;

				const nextButton =
					post.querySelector<HTMLButtonElement>("[aria-label='Next']") ??
					post.querySelector<HTMLButtonElement>("[aria-label='次へ']");
				if (!nextButton) return;

				e.stopPropagation();
				nextButton.click();
			}

			if (e.key === "h" || e.key === "ArrowLeft") {
				const post = getTargetPost();
				if (!post) return;

				const prevButton =
					post.querySelector<HTMLButtonElement>("[aria-label='Go back']") ??
					post.querySelector<HTMLButtonElement>("[aria-label='戻る']");
				if (!prevButton) return;

				e.stopPropagation();
				prevButton.click();
			}
		});
	},
});
