# 1단계: 빌드 스테이지
FROM node:24-alpine AS build-stage
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

ENV HUSKY=0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm config set minimum-release-age 0 \
    && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# 2단계: 실행 스테이지 (Nginx)
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist-demo /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]