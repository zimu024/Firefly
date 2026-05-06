import type { AnnouncementConfig } from "../types/config";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "公告",

	// 公告内容
	content: "博客正在整理中，先把学习笔记和项目复盘慢慢沉淀下来。",

	// 是否允许用户关闭公告
	closable: true,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "关于本站",
		// 链接 URL
		url: "/about/",
		// 内部链接
		external: false,
	},
};
