import type { CommentConfig } from "../types/config";

export const commentConfig: CommentConfig = {
	// 评论系统类型: none, twikoo, waline, giscus, disqus, artalk，默认为 none
	type: "twikoo",

	// Twikoo 评论系统配置，版本 1.7.4
	twikoo: {
		envId: "https://twikoo.vercel.app",
		lang: "zh-CN",
		visitorCount: true,
	},

	// Waline 评论系统配置
	waline: {
		serverURL: "https://waline.vercel.app",
		lang: "zh-CN",
		emoji: [
			"https://unpkg.com/@waline/emojis@1.4.0/weibo",
			"https://unpkg.com/@waline/emojis@1.4.0/bilibili",
			"https://unpkg.com/@waline/emojis@1.4.0/bmoji",
		],
		login: "enable",
		visitorCount: true,
	},

	// Artalk 评论系统配置
	artalk: {
		server: "https://artalk.example.com/",
		locale: "zh-CN",
		visitorCount: true,
	},

	// Giscus 评论系统配置
	giscus: {
		repo: "CuteLeaf/Firefly",
		repoId: "R_kgD2gfdFGd",
		category: "General",
		categoryId: "DIC_kwDOKy9HOc4CegmW",
		mapping: "title",
		strict: "0",
		reactionsEnabled: "1",
		emitMetadata: "1",
		inputPosition: "top",
		lang: "zh-CN",
		loading: "lazy",
	},

	// Disqus 评论系统配置
	disqus: {
		shortname: "firefly",
	},
};
