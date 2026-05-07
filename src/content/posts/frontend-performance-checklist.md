---
title: 前端性能优化实用清单
published: 2026-05-07
description: "一份可对照执行的性能优化清单，覆盖资源加载、渲染性能、图片优化和构建产物四个维度，每一项都附有具体操作和效果说明。"
tags: ["性能优化", "Web", "Lighthouse", "前端"]
category: 技术
draft: false
---

性能优化不需要从一开始就追求极致。更实际的做法是先把最见效的事情做了，然后随着页面变复杂再逐步深入。这份清单按投入产出比排序，每一项都可以在半天内落地。

## 资源加载

### 1. 启用 Brotli 压缩

比 Gzip 压缩率高 15-25%。现代 CDN 和 Web 服务器（Nginx 1.18+、Caddy）都原生支持。如果你的静态资源托管在 Vercel 或 Cloudflare Pages，默认已经启用，不需要额外配置。

验证方式：打开 DevTools Network 面板，看 Response Headers 中的 `Content-Encoding: br`。

### 2. 配置合理的缓存策略

静态资源（JS、CSS、字体、图片）应该用强缓存：

```
# Vercel 示例（vercel.json）
{
  "headers": [
    {
      "source": "/_astro/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

关键原则：文件名包含哈希的资源设为永久缓存 (`immutable`)；HTML 页面始终用协商缓存或不缓存。因为资源文件名变了就是新文件，而 HTML 需要保持更新及时。

### 3. 减少关键链路上的请求数量

打开 DevTools Coverage 面板（Ctrl+Shift+P → Coverage），录制页面加载过程，找出首屏用不到但仍在加载的 JS 和 CSS。这些就应该延迟加载或按需引入：

```javascript
// 不好的写法：首屏不需要的库在顶部静态导入
import { heavyChartLib } from "chart-library";

// 好的写法：需要时再动态导入
button.addEventListener("click", async () => {
  const { heavyChartLib } = await import("chart-library");
  heavyChartLib.render();
});
```

## 渲染性能

### 4. 避免布局抖动

布局抖动发生在交替读写 DOM 几何属性时，浏览器被迫反复重排。典型的不良模式：

```javascript
// 布局抖动：每次循环先读后写
elements.forEach((el) => {
  const height = el.offsetHeight; // 读
  el.style.height = `${height * 2}px`; // 写 → 触发重排
});
```

把读和写分两遍完成：

```javascript
// 先读
const heights = elements.map((el) => el.offsetHeight);
// 再写
elements.forEach((el, i) => {
  el.style.height = `${heights[i] * 2}px`;
});
```

### 5. 用 content-visibility 延迟渲染

对于折叠线以下的长列表或页面区块，`content-visibility: auto` 让浏览器跳过不可见区域的渲染工作：

```css
.post-card {
  content-visibility: auto;
  contain-intrinsic-size: 200px;
}
```

`contain-intrinsic-size` 给浏览器一个占位高度的估算值，防止滚动条跳动。对文章列表和评论区这类长滚动场景效果尤为明显。

### 6. 对频繁触发的事件使用防抖和节流

滚动、resize、输入框搜索是典型的高频触发场景。如果没有控制，回调可能每秒触发几十到上百次：

```typescript
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

// 搜索输入：用户停止输入 300ms 后才查询
searchInput.addEventListener("input", debounce(handleSearch, 300));
```

防抖适合"最后一次才执行"的场景（搜索、表单校验），节流适合"固定频率执行"的场景（滚动处理、进度更新）。

## 图片优化

### 7. 使用现代图片格式

WebP 和 AVIF 比 JPEG/PNG 体积小很多。在 Astro 中，一行配置就够了：

```typescript
// astro.config.mjs
image: {
  service: { entrypoint: "astro/assets/services/sharp" },
  defaultFormat: "avif",
}
```

如果 Serve 端不做处理，也可以用 `<picture>` 标签在 HTML 层面提供多格式回退。

### 8. 加上明确的宽高和 lazy loading

没有宽高的图片会在加载时推动页面内容移动（CLS 问题），体验很差：

```html
<!-- 不好：没有尺寸 -->
<img src="cover.jpg" alt="封面" />

<!-- 好：有尺寸，有懒加载 -->
<img src="cover.jpg" alt="封面" width="800" height="400" loading="lazy" />
```

`loading="lazy"` 对首屏图片不适用——首屏图应该用 `fetchpriority="high"` 加速加载。

## 构建产物

### 9. 分析并优化打包体积

定期用 `rollup-plugin-visualizer` 或 `vite-plugin-inspect` 看打包产物的组成。重点关注这几类问题：

- 某个库占了打包体积的 30% 以上——找更轻的替代品
- 同一个库被打包了多次——检查版本冲突
- moment.js 被引入了（带有大量 locale 文件）——换成 dayjs 或 date-fns
- polyfills 体积过大——检查 browserslist 是否设得过宽

### 10. 小资源内联为 Base64

小于 4KB 的图片或 SVG 内联可以省掉一次网络请求。Vite/Astro 中可以设 `assetsInlineLimit`：

```typescript
export default defineConfig({
  build: {
    assetsInlineLimit: 4096,
  },
});
```

## 总结

这十件事不需要一次性全部做完。按顺序来：先看缓存和压缩（通常是零成本的配置改动），再处理图片（体积收益最大），然后逐步优化渲染和打包。每搞定一项，跑一次 Lighthouse 看分数变化，你会清楚哪些改动对你这个具体项目最有价值。
