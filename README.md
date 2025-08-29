# Threads Dashboard

Meta Threads プラットフォームでのコンテンツ管理、分析、エンゲージメント管理を効率化するWebベースのダッシュボードアプリケーション。

## 技術スタック

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API Routes + tRPC
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js v5 + OAuth 2.0
- **Cache:** Redis
- **Package Manager:** pnpm

## 主な機能

- 🔐 OAuth 2.0による認証（Google、将来的にThreads対応）
- 📝 投稿の作成・管理・削除
- 📊 投稿分析・インサイト表示
- 💬 返信管理システム
- 🔔 Webhook設定・管理
- 📈 データ可視化・レポート機能

## 🚀 クイックスタート（初回セットアップ）

### 前提条件

- **Node.js:** 20+ (LTS版推奨)
- **pnpm:** 9+ (パッケージマネージャー)
- **Docker & Docker Compose** (データベース用)
- **Git** (ソースコード管理)

### ⚡ 最速セットアップ（5分で開始）

```bash
# 1. 依存関係のインストール
pnpm install

# 2. 開発用データベース起動
docker-compose -f docker-compose.dev.yml up -d postgres-dev redis-dev

# 3. Prismaセットアップ
pnpm db:generate
pnpm db:push

# 4. 開発サーバー起動
pnpm dev
```

🎉 **ブラウザで http://localhost:3000 を開いてアプリケーションを確認！**

---

## 📋 詳細セットアップガイド

### 1. プロジェクトのクローン・初期化

```bash
# プロジェクトをクローン
git clone <repository-url>
cd threads-dashboard

# 依存関係のインストール
pnpm install
```

### 2. 環境変数の設定

`.env`ファイルの環境変数を設定：

```env
# Database (開発用 - Dockerで自動起動)
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/threads_dashboard_dev?schema=public"

# NextAuth.js 認証設定
NEXTAUTH_SECRET="your-super-secret-jwt-secret-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# OAuth プロバイダー設定
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Meta Threads API (将来実装時に設定)
THREADS_APP_ID="your-threads-app-id"
THREADS_APP_SECRET="your-threads-app-secret"

# Redis キャッシュ (開発用 - Dockerで自動起動)
REDIS_URL="redis://localhost:6380"

# 開発環境
NODE_ENV="development"
```

#### 🔑 OAuth設定方法

**Google OAuth設定：**
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. 「APIs & Services > Credentials」に移動
4. 「OAuth 2.0 Client IDs」を作成
5. リダイレクトURIに `http://localhost:3000/api/auth/callback/google` を追加
6. Client ID と Client Secret を `.env` に設定

### 3. データベース・キャッシュのセットアップ

#### オプション1: Docker使用（推奨）
```bash
# 開発用PostgreSQL + Redisを起動
docker-compose -f docker-compose.dev.yml up -d postgres-dev redis-dev

# 起動確認
docker-compose -f docker-compose.dev.yml ps
```

#### オプション2: ローカルインストール
```bash
# PostgreSQL (Homebrew - macOS)
brew install postgresql@15
brew services start postgresql@15

# Redis (Homebrew - macOS)
brew install redis
brew services start redis

# 環境変数を適切に変更
DATABASE_URL="postgresql://username:password@localhost:5432/threads_dashboard_dev"
REDIS_URL="redis://localhost:6379"
```

### 4. Prisma データベース初期化

```bash
# Prismaクライアント生成
pnpm db:generate

# データベーススキーマの適用
pnpm db:push

# 【オプション】Prisma Studio起動 (データベースGUI)
pnpm db:studio
# ブラウザで http://localhost:5555 にアクセス
```

### 5. 開発サーバーの起動

```bash
# 開発サーバー起動 (Turbopack使用)
pnpm dev

# または型チェック付きで起動
pnpm dev && pnpm type-check
```

**アクセス先:**
- 🌐 **メインアプリ:** http://localhost:3000
- 🗄️ **Prisma Studio:** http://localhost:5555 (別途起動時)
- 📊 **開発ツール:** Next.js DevTools 自動起動

---

## 🔧 開発環境の詳細設定

### 推奨VSCode拡張機能

プロジェクトには `.vscode/extensions.json` が含まれているため、VSCodeで自動的に推奨拡張機能がインストールされます：

- **Tailwind CSS IntelliSense** - CSS補完・プレビュー
- **Prisma** - データベーススキーマサポート  
- **TypeScript Hero** - TypeScript強化
- **Prettier** - コード自動整形
- **ESLint** - コード品質チェック
- **Auto Rename Tag** - HTMLタグ自動リネーム
- **Path Intellisense** - パス補完
- **Error Lens** - エラー表示強化

### IDEでの型安全性確保

```bash
# TypeScript設定確認
pnpm type-check

# ESLint設定確認  
pnpm lint

# 全体的な品質チェック
pnpm build
```

## 開発用コマンド

```bash
# 開発サーバー起動
pnpm dev

# 型チェック
pnpm type-check

# Linting
pnpm lint

# ビルド
pnpm build

# テスト実行
pnpm test

# E2Eテスト
pnpm test:e2e

# Prismaコマンド
pnpm db:generate    # クライアント生成
pnpm db:push        # スキーマをDBにプッシュ
pnpm db:migrate     # マイグレーション作成・実行
pnpm db:studio      # Prisma Studio起動
```

## Dockerでの開発

### 開発環境

```bash
# 開発用サービス起動
docker-compose -f docker-compose.dev.yml up -d

# Prisma Studio起動（オプション）
docker-compose -f docker-compose.dev.yml up prisma-studio
```

### 本番環境

```bash
# 本番環境ビルド・起動
docker-compose up --build
```

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # NextAuth.js
│   │   └── trpc/         # tRPC endpoints
│   ├── globals.css       # グローバルスタイル
│   ├── layout.tsx        # ルートレイアウト
│   └── page.tsx          # ホームページ
├── lib/                   # ユーティリティ
│   └── db.ts             # Prisma client
├── server/                # サーバーサイド
│   ├── api/              # tRPC API
│   │   ├── routers/      # API routers
│   │   ├── root.ts       # ルートルーター
│   │   └── trpc.ts       # tRPC設定
│   └── auth.ts           # NextAuth.js設定
├── trpc/                  # tRPC client設定
│   ├── react.tsx         # React Query provider
│   └── server.ts         # サーバー側 tRPC
└── env.js                 # 環境変数型定義
```

## データベース設計

主要なモデル：
- **User**: ユーザー情報
- **Post**: 投稿データ
- **Reply**: 返信データ
- **Insight**: 分析データ
- **Webhook**: Webhook設定

詳細なスキーマは `prisma/schema.prisma` を参照。

## API設計

### tRPC Routers

- **posts**: 投稿CRUD操作
- **profile**: ユーザープロフィール
- **insights**: 分析データ（今後実装）
- **webhooks**: Webhook管理（今後実装）

### REST API Endpoints

- `GET/POST /api/auth/*` - NextAuth.js認証
- `GET/POST /api/trpc/[trpc]` - tRPC endpoint

## 認証

現在はGoogle OAuth2.0を使用。将来的にMeta Threads APIの公式OAuth対応時にThreads認証を追加予定。

## 🛠 トラブルシューティング

### よくある問題と解決方法

#### 1. ポートが既に使用されている
```bash
# ポート使用状況確認
lsof -i :3000  # Next.js
lsof -i :5433  # PostgreSQL
lsof -i :6380  # Redis

# プロセス終了
kill -9 <PID>
```

#### 2. Prismaエラー
```bash
# Prismaクライアント再生成
rm -rf node_modules/.prisma
pnpm db:generate

# データベース接続リセット
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d postgres-dev
pnpm db:push
```

#### 3. Node.jsバージョン問題
```bash
# Node.jsバージョン確認
node --version  # 20+ であることを確認

# nvmを使用してバージョン切り替え
nvm install 20
nvm use 20
```

#### 4. pnpm関連問題
```bash
# pnpmキャッシュクリア
pnpm store prune

# node_modules完全再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📈 開発フェーズ・ロードマップ

### ✅ Phase 1: プロジェクト基盤構築（完了）
- ✅ T3 Stack セットアップ (Next.js 15 + TypeScript + tRPC)
- ✅ Tailwind CSS + shadcn/ui セットアップ
- ✅ PostgreSQL + Prisma ORM 設定
- ✅ NextAuth.js v5 認証基盤
- ✅ Docker環境構築
- ✅ 基本レイアウト・ナビゲーション

### 🚧 Phase 2: 認証・コア機能実装（進行中 - 3週間）
- [ ] **ユーザー認証フロー完成**
  - [ ] Google OAuth認証画面
  - [ ] ログイン/ログアウト機能
  - [ ] セッション管理・自動更新
- [ ] **ユーザープロフィール表示**
  - [ ] プロフィール情報表示画面
  - [ ] プロフィール編集機能
- [ ] **投稿作成・管理機能（CRUD）**
  - [ ] 新規投稿作成UI
  - [ ] 投稿一覧表示（ページネーション）
  - [ ] 投稿詳細表示・編集・削除
- [ ] **基本ダッシュボード**
  - [ ] メインダッシュボード画面
  - [ ] 投稿統計表示
- [ ] **メディアアップロード機能**
  - [ ] 画像・動画アップロード
  - [ ] メディアライブラリ

### 🔮 Phase 3: 分析・高度機能実装（予定 - 2週間）
- [ ] **Meta Threads API統合**
  - [ ] Threads OAuth認証
  - [ ] 投稿API連携
  - [ ] プロフィールAPI連携
- [ ] **インサイトダッシュボード**
  - [ ] 投稿パフォーマンス分析
  - [ ] エンゲージメント率計算
  - [ ] 期間別レポート
- [ ] **データ可視化（Recharts）**
  - [ ] グラフ・チャート表示
  - [ ] トレンド分析
- [ ] **返信管理システム**
  - [ ] 返信一覧・詳細表示
  - [ ] 返信作成・削除
- [ ] **Webhook設定・管理機能**
  - [ ] Webhook URL設定
  - [ ] イベント通知設定

### ⚡ Phase 4: 最適化・品質保証（予定 - 1週間）
- [ ] **パフォーマンス最適化**
  - [ ] React Server Components活用
  - [ ] 画像最適化（Next.js Image）
  - [ ] Code Splitting実装
- [ ] **テストカバレッジ向上**
  - [ ] Unit Tests (Vitest)
  - [ ] E2E Tests (Playwright)
  - [ ] APIテスト
- [ ] **アクセシビリティ対応**
  - [ ] WCAG 2.1 AA準拠
  - [ ] キーボードナビゲーション
- [ ] **本番環境デプロイ**
  - [ ] Vercel/Railway設定
  - [ ] 環境変数設定
  - [ ] モニタリング設定

## ライセンス

MIT License

## コントリビューション

プロジェクトへの貢献を歓迎します。Issue報告、プルリクエストをお気軽にどうぞ。
