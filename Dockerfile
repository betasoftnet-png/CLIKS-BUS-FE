# Stage 1: Build the static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package dependency definitions
COPY package*.json ./

RUN npm ci

# Copy source code and build project
COPY . .

RUN npm run build


# Stage 2: Serve using Nginx
FROM nginx:alpine AS runner

WORKDIR /usr/share/nginx/html

# Remove default static files
RUN rm -rf ./*

# Copy compiled dist assets from builder stage
COPY --from=builder /app/dist .
