# Threads ダッシュボード アプリケーション
## 仕様書・要件定義書

### プロジェクト概要
**プロジェクト名:** Threads Dashboard  
**バージョン:** 1.0  
**作成日:** 2025年8月29日  
**対象:** Threads API を活用したソーシャルメディア管理ダッシュボード

### 1. システム概要

#### 1.1 目的
Meta Threads プラットフォームでのコンテンツ管理、分析、エンゲージメント管理を効率化するWebベースのダッシュボードアプリケーションを開発する。

#### 1.2 システム構成
- **フロントエンド:** Next.js 14 (App Router) with TypeScript
- **バックエンド:** Node.js with TypeScript + Fastify/tRPC
- **データベース:** PostgreSQL with Prisma ORM
- **キャッシュ:** Redis
- **認証:** NextAuth.js + OAuth 2.0 (Meta for Developers)
- **API:** Meta Threads API
- **スタイリング:** Tailwind CSS + shadcn/ui
- **状態管理:** Zustand / TanStack Query
- **デプロイメント:** Docker + Vercel/Railway対応

### 2. 機能要件

#### 2.1 ログイン機能

**概要:** Meta Threads アカウントでの認証・認可

**詳細要件:**
- OAuth 2.0による認証フロー実装
- アクセストークンの安全な管理と更新
- セッション管理機能
- ログアウト機能
- トークン期限切れ時の自動再認証

**技術仕様:**
- 認証ライブラリ: NextAuth.js v5 (Auth.js)
- 認証スコープ: `threads_basic`, `threads_content_publish`, `threads_manage_insights`
- セッション管理: JWT + Database Sessions
- トークン保存: 暗号化してPrismaで管理
- セッション有効期限: 24時間（自動延長対応）
- CSRF保護: NextAuth.js内蔵機能を使用

#### 2.2 投稿の作成と管理

##### 2.2.1 新しい投稿
**概要:** Threads への新規投稿作成機能

**機能詳細:**
- テキスト投稿作成（最大500文字）
- 画像・動画・GIF投稿対応
- ポール（投票）作成機能
- 位置情報タグ付け
- 投稿の予約投稿機能
- 下書き保存機能
- 返信制限設定

**UI要件:**
- モダンなUIコンポーネント（shadcn/ui使用）
- リッチテキストエディタ（TipTap/Lexical）
- メディアアップロード（react-dropzone + uploadthing）
- リアルタイムプレビュー
- 文字数カウンター（リアルタイム）
- レスポンシブデザイン（Tailwind CSS）
- ダークモード対応
- 投稿オプション設定パネル

##### 2.2.2 既存の投稿管理
**概要:** 過去の投稿の表示・編集・削除機能

**機能詳細:**
- 投稿一覧表示（ページネーション対応）
- 投稿の詳細表示
- 投稿の削除機能
- 投稿の編集機能（API制限に応じて）
- 投稿のソート・フィルタリング機能
- 一括操作機能

**表示項目:**
- 投稿内容
- 投稿日時
- エンゲージメント数（いいね、返信、リポスト）
- メディア添付状況
- 投稿ステータス

#### 2.3 メディアの取得

**概要:** 投稿関連メディアの管理機能

**機能詳細:**
- 投稿に添付されたメディアファイルの取得・表示
- メディアライブラリ機能
- メディアファイルのメタデータ表示
- サムネイル生成機能
- メディアの検索・フィルタリング

**対応フォーマット:**
- 画像: JPEG, PNG, GIF
- 動画: MP4, MOV
- その他: Meta Threads API対応フォーマット

#### 2.4 プロフィール情報の取得

**概要:** ユーザープロフィール情報の表示・管理

**取得情報:**
- ユーザー名・表示名
- プロフィール画像
- フォロワー数・フォロー数
- 投稿数
- プロフィール説明文
- アカウント認証状況
- プロフィールURL

**機能:**
- プロフィール情報の定期更新
- 複数アカウント対応（将来拡張）
- プロフィール分析レポート

#### 2.5 返信の管理

**概要:** 投稿への返信・エンゲージメント管理

**機能詳細:**
- 投稿への返信一覧取得・表示
- 返信への返信（スレッド管理）
- 返信の作成・送信
- 返信の削除・非表示
- 返信の承認・拒否機能
- 返信者の情報表示
- 返信の検索・フィルタリング

**通知機能:**
- 新しい返信の通知
- メンションの通知
- エンゲージメント通知

#### 2.6 インサイトの取得

**概要:** 投稿・アカウントの分析データ表示

**分析指標:**
- 投稿別パフォーマンス
  - 表示回数（インプレッション）
  - エンゲージメント率
  - いいね数・返信数・リポスト数
  - クリック数
  - リーチ数
- アカウント別分析
  - フォロワー増減
  - フォロワー属性（年代・地域）
  - 投稿頻度分析
  - 最適投稿時間分析

**レポート機能:**
- 期間指定分析（日次・週次・月次）
- グラフ・チャート表示
- CSV・PDF エクスポート
- 比較分析機能
- 成長トレンド分析

#### 2.7 Webhook の設定

**概要:** リアルタイムイベント通知システム

**対応イベント:**
- 新しい返信・メンション
- 新規フォロワー
- 投稿へのエンゲージメント
- アカウント関連イベント

**機能:**
- Webhook URL設定・管理
- イベントタイプ選択
- 通知フィルター設定
- Webhook ログ・履歴表示
- 通知テスト機能
- 複数Webhook設定対応

**通知方法:**
- アプリ内通知
- メール通知
- Slack連携（オプション）
- Discord連携（オプション）

### 3. 非機能要件

#### 3.1 パフォーマンス
- レスポンス時間: 平均2秒以内
- 同時接続ユーザー: 100ユーザー対応
- データベース負荷分散対応

#### 3.2 セキュリティ
- OAuth 2.0による認証
- HTTPS通信必須
- APIキー・トークンの暗号化保存
- CSRF・XSS対策実装
- レート制限対応

#### 3.3 可用性
- アップタイム: 99.5%以上
- 障害復旧時間: 1時間以内
- 定期バックアップ: 日次

#### 3.4 ユーザビリティ
- レスポンシブデザイン対応
- モバイルファースト設計
- アクセシビリティ対応（WCAG 2.1 AA準拠）
- 多言語対応（日本語・英語）

### 4. システム構成図

```
[Next.js App Router - SSR/CSR Hybrid]
            ↕ API Routes / tRPC
[Backend API - Node.js + TypeScript + Fastify]
            ↕ Prisma ORM
[PostgreSQL Database]
       ↕        ↕
[Redis Cache]  [External APIs]
               - Meta Threads API
               - Webhook Services
               - Upload Services

[Auth Layer - NextAuth.js]
[Monitoring - Sentry/DataDog]
[CI/CD - GitHub Actions]
```

### 5. データベース設計

#### 5.1 主要スキーマ（Prisma）

```prisma
model User {
  id              String    @id @default(cuid())
  threadsUserId   String    @unique @map("threads_user_id")
  username        String
  displayName     String?   @map("display_name")
  profileImageUrl String?   @map("profile_image_url")
  email           String?   @unique
  accessToken     String    @map("access_token") // encrypted
  refreshToken    String?   @map("refresh_token") // encrypted
  tokenExpiresAt  DateTime? @map("token_expires_at")
  
  posts     Post[]
  webhooks  Webhook[]
  accounts  Account[]
  sessions  Session[]
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@map("users")
}

model Post {
  id           String    @id @default(cuid())
  userId       String    @map("user_id")
  threadsPostId String   @unique @map("threads_post_id")
  content      String
  mediaUrls    Json?     @map("media_urls")
  postType     PostType  @default(TEXT) @map("post_type")
  status       PostStatus @default(PUBLISHED)
  publishedAt  DateTime? @map("published_at")
  
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  insights  Insight[]
  replies   Reply[]
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@index([userId])
  @@map("posts")
}

model Insight {
  id         String     @id @default(cuid())
  postId     String     @map("post_id")
  metricType MetricType @map("metric_type")
  value      Int
  recordedAt DateTime   @map("recorded_at")
  
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  @@index([postId, metricType])
  @@map("insights")
}

enum PostType {
  TEXT
  IMAGE
  VIDEO
  POLL
  CAROUSEL
}

enum PostStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
  DELETED
}

enum MetricType {
  IMPRESSIONS
  LIKES
  REPLIES
  REPOSTS
  QUOTES
  CLICKS
  REACH
}
```

### 6. API仕様

#### 6.1 API構成（tRPC + Next.js API Routes）

**tRPC Router構成**
```typescript
// app/server/routers/_app.ts
export const appRouter = createTRPCRouter({
  auth: authRouter,
  posts: postsRouter,
  media: mediaRouter,
  insights: insightsRouter,
  webhooks: webhooksRouter,
  profile: profileRouter,
});

// 型安全なクライアント
export type AppRouter = typeof appRouter;
```

**主要API エンドポイント**

**認証関連（NextAuth.js + API Routes）**
- `GET /api/auth/signin` - OAuth認証開始
- `GET /api/auth/callback/threads` - OAuth認証完了
- `POST /api/auth/signout` - ログアウト
- `GET /api/auth/session` - セッション情報取得

**tRPC プロシージャ**
```typescript
// 投稿管理
posts.getAll()        // 投稿一覧取得
posts.create()        // 新規投稿作成
posts.getById()       // 投稿詳細取得
posts.update()        // 投稿更新
posts.delete()        // 投稿削除
posts.schedule()      // 投稿スケジュール

// インサイト
insights.getPostMetrics()     // 投稿別インサイト
insights.getAccountAnalytics() // アカウント分析
insights.exportData()         // データエクスポート

// Webhook
webhooks.getAll()     // Webhook一覧
webhooks.create()     // Webhook作成
webhooks.update()     // Webhook更新
webhooks.delete()     // Webhook削除
webhooks.test()       // Webhook テスト
```

### 7. 開発フェーズ

#### Phase 1: プロジェクト基盤構築（2週間）
```bash
# T3 Stack セットアップ
create-t3-app@latest threads-dashboard
# または Next.js + tRPC手動セットアップ

# 設定項目:
- Next.js 14 App Router
- TypeScript strict mode
- Tailwind CSS + shadcn/ui
- tRPC
- Prisma + PostgreSQL
- NextAuth.js v5
- ESLint + Prettier
```
- Docker環境構築
- Prismaスキーマ設計・マイグレーション
- NextAuth.js OAuth設定
- 基本レイアウト・ナビゲーション

#### Phase 2: 認証・コア機能実装（3週間）
- Threads OAuth認証フロー実装
- ユーザープロフィール表示
- 投稿作成・管理機能（CRUD）
- メディアアップロード機能
- リアルタイム更新（Server-Sent Events）

#### Phase 3: 分析・高度機能実装（2週間）
- インサイトダッシュボード
- データ可視化（Recharts）
- 返信管理システム
- Webhook設定・管理機能
- 検索・フィルタリング機能

#### Phase 4: 最適化・品質保証（1週間）
- パフォーマンス最適化（React Compiler, Suspense）
- E2Eテスト（Playwright）
- セキュリティ監査
- アクセシビリティ対応
- 本番環境デプロイ

### 8. 技術要件

#### 8.1 開発環境
- **Node.js:** 20+ (LTS)
- **Next.js:** 14+ (App Router)
- **TypeScript:** 5+
- **PostgreSQL:** 15+
- **Redis:** 7+
- **Docker & Docker Compose**
- **pnpm** (パッケージマネージャー)

#### 8.2 主要ライブラリ・フレームワーク

**フロントエンド (Next.js):**
```json
{
  "framework": "Next.js 14 (App Router)",
  "styling": "Tailwind CSS + shadcn/ui",
  "components": "@radix-ui/react-*",
  "state": "Zustand + TanStack Query",
  "forms": "React Hook Form + Zod",
  "editor": "@tiptap/react",
  "charts": "Recharts / Chart.js",
  "animations": "Framer Motion",
  "icons": "Lucide React",
  "auth": "NextAuth.js v5",
  "uploads": "UploadThing",
  "utils": "clsx, tailwind-merge"
}
```

**バックエンド (Node.js + TypeScript):**
```json
{
  "framework": "Fastify / Express",
  "api": "tRPC",
  "orm": "Prisma",
  "validation": "Zod",
  "cache": "Redis + ioredis",
  "auth": "NextAuth.js adapters",
  "logging": "Pino",
  "testing": "Vitest + Playwright",
  "env": "T3 Env",
  "cron": "@vercel/cron / node-cron",
  "webhooks": "svix"
}
```

**開発・デプロイ:**
```json
{
  "bundler": "Turbopack (Next.js)",
  "linting": "ESLint + Prettier",
  "typecheck": "TypeScript strict mode",
  "testing": "Vitest + Testing Library + Playwright",
  "ci": "GitHub Actions",
  "deployment": "Vercel / Railway / Docker",
  "monitoring": "Sentry + Vercel Analytics",
  "database": "PlanetScale / Supabase / Railway"
}
```

#### 8.3 外部サービス・インフラ
```json
{
  "api": "Meta Threads API",
  "auth": "Meta for Developers OAuth",
  "database": "PostgreSQL (PlanetScale/Supabase/Railway)",
  "cache": "Redis (Upstash/Railway)",
  "storage": "Uploadthing / AWS S3 / Cloudinary",
  "email": "Resend / SendGrid",
  "monitoring": "Sentry + Vercel Analytics",
  "deployment": "Vercel / Railway",
  "cdn": "Vercel Edge Network / Cloudflare",
  "webhooks": "Svix / ngrok (開発時)"
}
```

### 9. モダン開発手法・ベストプラクティス

#### 9.1 コード品質
```typescript
// T3 Stack型安全性例
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const createPostSchema = z.object({
  content: z.string().min(1).max(500),
  mediaUrls: z.array(z.string().url()).optional(),
  scheduledFor: z.date().optional(),
});

export const postsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      // 完全な型安全性を保証
      return ctx.db.post.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),
});
```

#### 9.2 パフォーマンス最適化
- **React Server Components** - サーバーサイドレンダリング最適化
- **Streaming SSR** - ページ読み込み時間短縮
- **Image Optimization** - Next.js Image コンポーネント
- **Code Splitting** - 動的インポート活用
- **Edge Caching** - Vercel Edge Network
- **Database Connection Pooling** - Prisma connection pool

#### 9.3 開発体験（DX）改善
```json
// package.json scripts
{
  "dev": "next dev --turbo",
  "build": "next build",
  "type-check": "tsc --noEmit",
  "lint": "next lint",
  "test": "vitest",
  "test:e2e": "playwright test",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:studio": "prisma studio"
}
```

#### 9.4 CI/CD パイプライン
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - name: Type Check
        run: pnpm type-check
      - name: Unit Tests
        run: pnpm test
      - name: E2E Tests
        run: pnpm test:e2e
      - name: Build
        run: pnpm build
```

### 10. セキュリティ・運用考慮事項

#### 10.1 セキュリティ対策
- **Next.js セキュリティ** - CSP, CSRF Protection, XSS対策
- **tRPC認証** - セッションベース認証ミドルウェア
- **入力検証** - Zod スキーマによる厳密な型検証
- **レート制限** - Upstash Rate Limiting
- **環境変数** - T3 Env による型安全な環境変数管理
- **監査ログ** - Prisma Audit Logging

#### 10.2 モニタリング・可観測性
```typescript
// app/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
```

**監視項目:**
- アプリケーションパフォーマンス（Sentry）
- Webバイタル（Vercel Analytics）
- データベースパフォーマンス（Prisma Metrics）
- API使用量・エラー率（tRPC meta）
- リアルタイムエラートラッキング

#### 10.3 バックアップ・復旧戦略
- **データベース** - 自動バックアップ（PlanetScale/Supabase）
- **設定管理** - Infrastructure as Code (Vercel/Railway)
- **コード** - Git履歴 + ブランチ戦略
- **メディアファイル** - CDN + オリジン保護

### 11. 今後の拡張計画・ロードマップ

#### Phase 5: エンタープライズ機能（拡張）
- **マルチテナント対応** - 組織・チーム管理
- **高度な分析** - カスタムダッシュボード、A/Bテスト
- **ワークフロー自動化** - Zapier連携、カスタムトリガー
- **API拡張** - パブリックAPI提供、Webhook拡張

#### Phase 6: AI・機械学習統合
- **コンテンツ最適化** - AI投稿提案、最適投稿時間予測  
- **自動化機能** - 自動返信、コンテンツ分類
- **パーソナライゼーション** - ユーザー行動分析、カスタムレコメンド

#### Phase 7: プラットフォーム拡張
- **マルチプラットフォーム** - Instagram, Twitter/X連携
- **モバイルアプリ** - React Native / Expo
- **デスクトップアプリ** - Tauri / Electron
- **ブラウザ拡張** - Chrome Extension

#### 技術的改善項目
- **エッジコンピューティング** - Vercel Edge Functions活用
- **リアルタイム機能** - WebSocket/Server-Sent Events強化
- **オフライン対応** - PWA化、Service Worker
- **国際化** - next-intl による多言語対応

---

**技術スタック要約:**
```
Frontend: Next.js 14 + TypeScript + Tailwind + shadcn/ui
Backend: Node.js + TypeScript + tRPC + Fastify
Database: PostgreSQL + Prisma ORM
Auth: NextAuth.js v5 + OAuth 2.0
Cache: Redis + TanStack Query
Deploy: Vercel + PlanetScale + Upstash
Monitor: Sentry + Vercel Analytics
```

**承認者:**  
**作成者:**  
**レビュー日:**