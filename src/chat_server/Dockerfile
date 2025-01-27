FROM node:18-alpine AS builder
WORKDIR /usr/src/app/chat_server
COPY package*.json ./
RUN npm install --production
COPY . .

FROM node:18-alpine
WORKDIR /usr/src/app/chat_server
COPY --from=builder /usr/src/app/chat_server .
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /usr/src/app/chat_server
USER appuser
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "index.js"]
