# DevOps, CI/CD & Deployment Guide
## Project: AI-Powered Personal Kanban & Intelligent Daily Planner

---

## 1. Chiến lược Triển khai Hạ tầng (Infrastructure Strategy)

| Thành phần | Nền tảng Đề xuất (Free / Study) | Nền tảng Nâng cao (AWS Production) | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Frontend (Next.js)** | **Vercel Free Tier** | AWS CloudFront + S3 / AWS Amplify | Deploy tự động khi push nhánh `main` |
| **Backend (NestJS)** | **Render / Railway / Fly.io** (Docker) | AWS ECS Fargate / AWS App Runner | Chạy multi-stage Docker container |
| **Database (Postgres)** | **Supabase PostgreSQL Free** | **AWS RDS PostgreSQL** (Free Tier / t4g.micro) | Switch 1 dòng `DATABASE_URL` |
| **CI/CD Pipeline** | **GitHub Actions** | GitHub Actions / AWS CodePipeline | Tự động test, lint, build image & deploy |

---

## 2. Dockerfile Chuẩn hóa (Production Multi-Stage Build cho NestJS)

File `apps/api/Dockerfile`:
```dockerfile
# Stage 1: Base & Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
RUN npm install -g pnpm
RUN cd apps/api && npx prisma generate
RUN pnpm --filter api build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/prisma ./prisma

USER nestjs
EXPOSE 4000
ENV PORT=4000

CMD ["node", "dist/main.js"]
```

---

## 3. GitHub Actions CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

```yaml
name: CI/CD Pipeline - AI Kanban Planner

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    name: Code Quality & Automated Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Prisma Client Generation
        run: npm run db:generate --workspace=apps/api

      - name: Run ESLint & Typecheck
        run: npm run lint

      - name: Run Backend Unit Tests
        run: npm run test --workspace=apps/api

  deploy-frontend:
    name: Deploy Next.js to Vercel
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    name: Deploy NestJS Docker Image
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Trigger Webhook Deploy (Render / Railway / Fly.io)
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_URL }}"
```

---

## 4. Danh mục Biến Môi trường (Environment Variables Reference)

### 4.1. Backend (`apps/api/.env`)
```env
PORT=4000
NODE_ENV=production
FRONTEND_URL="https://your-kanban-app.vercel.app"

# Database (Supabase hoặc AWS RDS)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"

# Authentication & JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="your-refresh-secret-min-32-chars-long"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Google OAuth2
GOOGLE_CLIENT_ID="xxxx-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxx-google-client-secret"
GOOGLE_CALLBACK_URL="https://your-backend-api.onrender.com/api/v1/auth/google/callback"

# Security (AES-256-GCM Master Key)
ENCRYPTION_SECRET_KEY="32-bytes-secure-random-encryption-key-for-aes256"

# AI Providers (System Fallback Keys)
DEFAULT_AI_PROVIDER="GEMINI"
GEMINI_API_KEY="AIzaSyYourGeminiApiKey"
OPENAI_API_KEY="sk-proj-YourOpenAIApiKey"
ANTHROPIC_API_KEY="sk-ant-YourClaudeApiKey"
```

### 4.2. Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL="https://your-backend-api.onrender.com/api/v1"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="xxxx-google-client-id.apps.googleusercontent.com"
```
