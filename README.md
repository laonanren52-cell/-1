# Earth OL — 人生打卡

一个移动端优先的「人生成就打卡」Web App。像玩游戏一样解锁生活中的小成就，AI 会根据你的真实感受写一段专属成就评价。

---

## 功能

- **成就打卡** — 110+ 条内置成就，涵盖恋爱、生活、成长、自愈、社交、学习、勇气、健康、亲情、校园 10 个维度
- **AI 成就评价** — 智能体分析你的文字和情绪，生成温柔、真诚、有仪式感的专属夸奖文案
- **情绪标签选择** — 打卡时可以选择开心、紧张、释然、骄傲等 14 种情绪
- **情绪文本分析** — AI 自动识别你文字中的情绪（被拒绝、失落、开心等），生成对应回复
- **人生等级系统** — 根据已解锁成就数自动计算等级（Lv.1 探索者 ~ Lv.6 人生大师）
- **连续打卡统计** — 自动记录连续打卡天数
- **成就图鉴** — 分类筛选、稀有度筛选、关键词搜索完整成就库
- **每日推荐** — 今日推荐 1 个未完成成就 + 换一批
- **本地数据存储** — 打卡记录保存在浏览器 localStorage，无需注册
- **数据安全** — 启动时自动检测并清理 localStorage 中的乱码数据，提供「清除本地数据」按钮

## 设计风格

- 奶白色暖色调背景
- 雾青绿（sage）主色
- 柔和玻璃拟态、大圆角、轻阴影
- 移动端优先，桌面端自适应
- 低调滑动光效（shimmer / sheen）
- 不廉价、不过度霓虹、不二次元

## 技术栈

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** — 轻量动画
- **Lucide React** — 图标
- **localStorage** — 数据持久化

## 快速开始

```bash
git clone https://github.com/laonanren52-cell/-1.git
cd Earth-OL

# 安装依赖
npm install

# 开发模式
npm run dev
# 访问 http://localhost:3000

# 生产构建
npm run build
npm start
# 访问 http://localhost:3000
```

> 注意：Google Fonts（Noto Sans SC）在构建时会尝试从 fonts.gstatic.com 下载，若网络不可达会自动 fallback 到系统字体，不影响功能。

## 项目结构

```
├── app/
│   ├── page.tsx              # 首页：Hero + 推荐 + AI 提示 + 精选成就
│   ├── achievements/
│   │   └── page.tsx          # 成就图鉴：搜索 + 分类 + 稀有度筛选
│   ├── records/
│   │   └── page.tsx          # 历史打卡记录 + 分类筛选
│   ├── profile/
│   │   └── page.tsx          # 个人数据 + 清除本地数据
│   ├── layout.tsx            # Root layout
│   └── globals.css           # 全局样式 + shimmer 光效
├── components/
│   ├── BottomNav.tsx          # 底部导航（spring 动画指示器）
│   ├── AchievementCard.tsx    # 成就卡片（入场动画 + 稀有度样式）
│   ├── CheckInDialog.tsx      # 打卡弹窗（情绪选择 + AI 生成 + 结果展示）
│   └── FilterBar.tsx          # 分类筛选器
├── data/
│   ├── achievements.ts        # 110+ 条成就数据库
│   ├── emotionTags.ts         # 14 种情绪标签
│   ├── praiseTemplates.ts     # 50+ AI 夸奖模板片段
│   └── dailyTasks.ts          # 每日推荐任务生成器
├── lib/
│   ├── textGuard.ts           # 乱码检测 + 文案去重 + 安全出口
│   ├── storage.ts             # localStorage 封装 + 数据迁移 + 重置
│   ├── aiPraise.ts            # AI 生成入口
│   └── achievementAgent.ts    # 智能体核心：情绪分析 + 模板匹配 + 去重
└── types/
    └── achievement.ts         # TypeScript 类型定义
```

## AI 评价系统

本地智能体 `AchievementPraiseAgent` 在浏览器端运行，无需 API Key：

1. **情绪分析** — `detectEmotionFromText()` 识别用户输入中的关键词
2. **场景判定** — 识别「被拒绝了」「出去玩」「知道了」等典型场景
3. **模板匹配** — 根据成就分类、稀有度、情绪，从 50+ 模板片段中组合
4. **文案去重** — `cleanGeneratedText()` 去除重复句子，控制长度 90-160 字
5. **安全出口** — `sanitizeText()` 检测乱码，`safeFallback()` 提供默认文案

### 典型场景示例

**用户写「被拒绝了」：**
> 被拒绝确实会让人失落，真心没有被接住的时候，难免会有一点难过。但你依然选择了去尝试。地球 Online 已记录：你没有把遗憾留给沉默。

**用户写「出去玩」+ 情绪「不知道算不算完成」：**
> 你出去玩当然也算完成，因为你真的把时间还给了自己。什么也不做、暂时离开压力，本来就是一种认真休息。

## 内置成就

| 分类 | 数量 | 稀有度分布 |
|------|------|-----------|
| 恋爱篇 | 12 | 普通·稀有·史诗 |
| 生活篇 | 12 | 普通·稀有·史诗 |
| 成长篇 | 12 | 普通·稀有·史诗 |
| 自愈篇 | 12 | 普通·稀有·史诗 |
| 社交篇 | 10 | 普通·稀有·史诗 |
| 学习篇 | 12 | 普通·稀有·史诗 |
| 勇气篇 | 12 | 普通·稀有·史诗·传说 |
| 健康篇 | 10 | 普通·稀有 |
| 亲情篇 | 10 | 普通·稀有·史诗 |
| 校园篇 | 10 | 普通·稀有·史诗·传说 |

## 稀有度视觉

| 稀有度 | 标签色 | 卡片效果 |
|--------|--------|---------|
| 普通 | 灰蓝 | 简约边框 |
| 稀有 | 鼠尾草绿 | 边框微光 |
| 史诗 | 哑光紫 | 渐变徽章 |
| 传说 | 暖金 | 边框辉光 + 金色渐变 |

## 浏览器兼容

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+
- 移动端 iOS Safari / Chrome Android

## 许可

MIT
