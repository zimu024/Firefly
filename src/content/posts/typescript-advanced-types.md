---
title: TypeScript 常用高级类型技巧
published: 2026-05-07
description: "整理日常开发中最实用的 TypeScript 类型技巧，从泛型约束、条件类型到工具类型，提升代码的类型安全性和可维护性。"
tags: ["TypeScript", "类型系统", "前端开发"]
category: 技术
draft: false
---

TypeScript 的类型系统非常强大，但很多人在日常开发中只用到 `interface` 和基本类型标注。这篇文章整理几个在实际项目中真正有用、能明显改善代码质量的高级类型技巧。

## 泛型约束

泛型本身不难，关键是学会加约束。如果不加约束，泛型就只是"任意类型"：

```typescript
// 没有约束：T 可以是任何类型
function getLength<T>(val: T): number {
  return val.length; // 错误：T 上没有 length
}

// 加上约束：T 必须有 length 属性
function getLength<T extends { length: number }>(val: T): number {
  return val.length; // 正确
}
```

更常见的场景是约束对象形状。比如一个函数要求传入的对象必须包含 `id` 字段：

```typescript
function save<T extends { id: string }>(record: T): T {
  console.log(`Saving record: ${record.id}`);
  return record;
}

save({ id: "user-1", name: "子沐" }); // OK
save({ name: "子沐" }); // 类型错误：缺少 id
```

这种方式比使用 `any` 安全，同时保留了入参的具体类型信息。

## keyof 和索引访问类型

`keyof` 用来获取一个类型所有键的联合类型，配合泛型可以做精确的属性访问：

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: "u1", name: "子沐", age: 25 };
getProperty(user, "name"); // 返回类型: string
getProperty(user, "age");  // 返回类型: number
getProperty(user, "x");    // 类型错误：'x' 不在 user 的键中
```

这看起来简单，但在封装通用工具函数时非常有用。你不需要手写函数重载，TypeScript 会自动推导出准确的返回类型。

## 条件类型

条件类型让类型可以根据条件变换，语法类似三元表达式：

```typescript
type IsString<T> = T extends string ? "是字符串" : "不是字符串";

type A = IsString<"hello">; // "是字符串"
type B = IsString<42>;       // "不是字符串"
```

一个实际的应用场景是提取 Promise 的内部类型：

```typescript
type Unwrap<T> = T extends Promise<infer U> ? U : T;

type R1 = Unwrap<Promise<string>>;  // string
type R2 = Unwrap<number>;           // number（非 Promise 保持原样）
```

`infer` 关键字在这里从 Promise 中"推断"出包裹的类型，然后作为结果返回。Awaited 是 TypeScript 内置的类似工具类型，在需要处理异步返回值的场景下经常用到。

## 模板字面量类型

TypeScript 4.1 引入的模板字面量类型可以在类型层面拼接字符串：

```typescript
type EventName<T extends string> = `on${Capitalize<T>}`;

type ClickEvent = EventName<"click">;   // "onClick"
type ChangeEvent = EventName<"change">; // "onChange"
```

更实用的例子是构建类型安全的路径匹配。比如从一个对象类型生成嵌套路径：

```typescript
type NestedPaths<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? `${K}` | `${K}.${NestedPaths<T[K]>}`
        : never;
    }[keyof T]
  : never;

type User = { profile: { name: string; avatar: string }; settings: { theme: string } };
type Paths = NestedPaths<User>;
// "profile" | "profile.name" | "profile.avatar" | "settings" | "settings.theme"
```

这样在写表单或状态管理时就能获得精确的路径自动补全，避免手写字符串拼错。

## 实用内置工具类型

TypeScript 自带多个工具类型，日常开发中这几个使用频率很高：

```typescript
// Partial: 所有属性变为可选
type PartialUser = Partial<{ id: string; name: string }>;
// { id?: string; name?: string }

// Pick: 从类型中选取指定属性
type UserPreview = Pick<User, "id" | "name">;
// { id: string; name: string }

// Omit: 从类型中排除指定属性
type UserWithoutId = Omit<User, "id">;
// { name: string }

// Record: 构造一个键值对类型
type PageRoutes = Record<"home" | "about" | "archive", string>;
// { home: string; about: string; archive: string }

// Extract / Exclude: 从联合类型中提取或排除
type EventTypes = "click" | "focus" | "blur" | "keydown";
type MouseEvents = Extract<EventTypes, "click">;        // "click"
type NonMouseEvents = Exclude<EventTypes, "click">;     // "focus" | "blur" | "keydown"
```

掌握这些工具类型后，你会发现很多之前需要手动维护的类型代码可以自动推导出来，减少了类型定义与运行时代码不同步的风险。

## 总结

TypeScript 类型系统最大的价值不是"让代码更复杂"，而是"让意图更明确"。当你把业务约束编码到类型中，编译器就能在写代码的阶段发现逻辑漏洞，而不是等到运行时才暴露。
