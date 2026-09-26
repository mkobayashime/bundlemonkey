import * as v from "valibot";

const antiFeatureSchema = v.object({
	type: v.union([v.literal("ads"), v.literal("tracking"), v.literal("miner")]),
	description: v.string(),
});

const grantSchema = v.union([
	v.literal("GM.addElement"),
	v.literal("GM.addStyle"),
	v.literal("GM.addValueChangeListener"),
	v.literal("GM.deleteValue"),
	v.literal("GM.deleteValues"),
	v.literal("GM.download"),
	v.literal("GM.getResourceText"),
	v.literal("GM.getResourceUrl"),
	v.literal("GM.getTab"),
	v.literal("GM.getTabs"),
	v.literal("GM.getValue"),
	v.literal("GM.getValues"),
	v.literal("GM.info"),
	v.literal("GM.listValues"),
	v.literal("GM.log"),
	v.literal("GM.notification"),
	v.literal("GM.openInTab"),
	v.literal("GM.registerMenuCommand"),
	v.literal("GM.removeValueChangeListener"),
	v.literal("GM.saveTab"),
	v.literal("GM.setClipboard"),
	v.literal("GM.setValue"),
	v.literal("GM.setValues"),
	v.literal("GM.unregisterMenuCommand"),
	v.literal("GM.xmlHttpRequest"),
	v.literal("GM_addElement"),
	v.literal("GM_addStyle"),
	v.literal("GM_addValueChangeListener"),
	v.literal("GM_cookie"),
	v.literal("GM_deleteValue"),
	v.literal("GM_deleteValues"),
	v.literal("GM_download"),
	v.literal("GM_getResourceText"),
	v.literal("GM_getResourceURL"),
	v.literal("GM_getTab"),
	v.literal("GM_getTabs"),
	v.literal("GM_getValue"),
	v.literal("GM_getValues"),
	v.literal("GM_info"),
	v.literal("GM_listValues"),
	v.literal("GM_log"),
	v.literal("GM_notification"),
	v.literal("GM_openInTab"),
	v.literal("GM_registerMenuCommand"),
	v.literal("GM_removeValueChangeListener"),
	v.literal("GM_saveTab"),
	v.literal("GM_setClipboard"),
	v.literal("GM_setValue"),
	v.literal("GM_setValues"),
	v.literal("GM_unregisterMenuCommand"),
	v.literal("GM_webRequest"),
	v.literal("GM_xmlhttpRequest"),
	v.literal("unsafeWindow"),
	v.literal("window.close"),
	v.literal("window.focus"),
	v.literal("window.onurlchange"),
]);

const resourceSchema = v.object({
	name: v.string(),
	url: v.string(),
});

const runAtSchema = v.union([
	v.literal("document-end"),
	v.literal("document-start"),
	v.literal("document-body"),
	v.literal("document-idle"),
	v.literal("context-menu"),
]);

const sandboxSchema = v.union([v.literal("raw"), v.literal("JavaScript"), v.literal("DOM")]);

const injectIntoSchema = v.union([v.literal("page"), v.literal("content"), v.literal("auto")]);

export const metaSchema = v.object({
	name: v.pipe(
		// https://github.com/fabian-hiller/valibot/issues/1034#issuecomment-2634468346
		v.optional(v.string(), () => undefined),
		v.string('"name" is required'),
	),
	namespace: v.optional(v.string()),
	copyright: v.optional(v.string()),
	version: v.pipe(
		v.optional(v.string(), () => undefined),
		v.string('"version" is required'),
	),
	description: v.optional(v.string()),
	icon: v.optional(v.string()),
	grant: v.optional(v.union([v.array(grantSchema), v.literal("none")]), []),
	author: v.optional(v.string()),
	homepage: v.optional(v.string()),
	antiFeature: v.optional(v.array(antiFeatureSchema), []),
	require: v.optional(v.array(v.string()), []),
	resource: v.optional(v.array(resourceSchema), []),
	match: v.optional(v.array(v.string()), []),
	excludeMatch: v.optional(v.array(v.string()), []),
	include: v.optional(v.array(v.string()), []),
	exclude: v.optional(v.array(v.string()), []),
	runAt: v.optional(runAtSchema),
	runIn: v.optional(v.array(v.string()), []),
	sandbox: v.optional(sandboxSchema),
	injectInto: v.optional(injectIntoSchema),
	tag: v.optional(v.array(v.string()), []),
	connect: v.optional(v.array(v.string()), []),
	noframes: v.optional(v.boolean(), false),
	updateURL: v.optional(v.string()),
	downloadURL: v.optional(v.string()),
	supportURL: v.optional(v.string()),
	unwrap: v.optional(v.boolean(), false),
	topLevelAwait: v.optional(v.boolean(), false),
});
export type Meta = v.InferInput<typeof metaSchema>;
export type ParsedMeta = v.InferOutput<typeof metaSchema>;
