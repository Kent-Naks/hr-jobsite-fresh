########################################################
# Stage 1: build your Next.js application             #
########################################################
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json yarn.lock* ./
RUN npm ci
COPY . .
RUN npm run build

########################################################
# Stage 2: run the Next.js server in production mode   #
########################################################
FROM node:18-alpine AS runner

WORKDIR /app
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]

