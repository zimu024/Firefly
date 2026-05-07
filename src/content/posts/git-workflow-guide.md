---
title: Git 高效工作流与 Commit 规范
published: 2026-05-07
description: "从实际项目出发，整理一套清晰实用的 Git 工作流和提交信息规范，让团队协作和代码追溯不再混乱。"
tags: ["Git", "工作流", "规范", "协作"]
category: 技术
draft: false
---

Git 本身很灵活，但灵活的代价是每个人都可以按自己的方式使用。如果没有约定，提交历史很快会变成难以阅读的流水账。这篇文章整理我在项目中实际使用的分支策略和提交规范。

## 分支策略

我目前使用简化版的 Trunk-Based 分支模型，适合小团队和个人项目：

```
main ─────●──────────●──────────●──────
           \        /          /
feature/a   ●──●──●          /
                             /
feature/b   ●──●──●─────────
```

**三条核心规则：**

- `main` 分支始终可部署，不直接在 main 上提交
- 每个功能 / 修复从 main 拉出独立分支
- 合并前必须通过 CI 检查

分支命名遵循统一格式：

```
feature/article-toc        # 新功能
fix/navbar-overlap         # 问题修复
chore/update-deps          # 依赖更新
docs/api-usage             # 文档补充
```

这种命名方式一眼就能看出分支的目的，在 `git branch` 列表里也不会混淆。

## Commit Message 规范

我使用 Conventional Commits 格式，结构如下：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| Type | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(search): add full-text search support` |
| `fix` | 问题修复 | `fix(toc): correct heading level detection` |
| `refactor` | 重构（无功能变化） | `refactor(utils): extract date formatting logic` |
| `style` | 代码格式（空格、分号等） | `style(nav): fix indentation` |
| `docs` | 文档变更 | `docs(readme): update deployment guide` |
| `chore` | 构建 / 工具变更 | `chore(deps): upgrade astro to 6.1` |
| `test` | 测试相关 | `test(api): add user auth test cases` |
| `perf` | 性能优化 | `perf(images): switch to avif format` |

### Subject 主题

主题行控制在 50 个字符以内，使用祈使句（像在发命令），不要句号结尾：

```
# 好的写法
fix(nav): resolve sticky header overlap on mobile
feat(rss): generate full-content feed with images

# 不好的写法
Fixed nav overlap issue.       # 过去式 + 句号
navbar bug fix                 # 缺少 type，信息模糊
```

### Body 正文

当变更原因不是显而易见的，用正文解释。比如：

```
fix(image): fallback to local placeholder on api timeout

The random image API occasionally times out after 5 seconds.
Added a retry mechanism with 3 attempts, then fall back to
the configured local placeholder image.
```

这里回答了"为什么用重试而不是直接降级"以及"为什么设为 3 次"，这些决策在 Code Review 和未来回溯时很有价值。

## Pull Request 规范

PR 标题沿用同一条 commit 规范。描述部分包含三个部分：

```markdown
## 做了什么
- 为文章页新增了浮动目录组件
- 目录跟随滚动自动高亮当前标题

## 为什么这么做
用户在长文章中容易迷失位置，浮动目录提供持续可见的导航参考。

## 验证方式
1. 打开任意文章页
2. 滚动页面，观察目录高亮是否跟随
3. 点击目录项验证跳转是否准确
```

## 合并策略

我的偏好是 **Squash Merge**：

```
feature/a: ●──●──●
                    ↘
main: ───────────────● (一条干净 commit)
```

每次合并把整个 PR 压成一个有意义的 commit。这样 main 分支上每个 commit 都是一个完整的功能单元，`git log --oneline` 清晰可读。

退一步说，规范的存在不是为了约束，而是为了让六个月后的自己还能看懂当时做了什么。
