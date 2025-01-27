FROM node:18-alpine AS builder
WORKDIR /usr/src/app/spam_service
COPY package*.json ./
RUN npm install --production
COPY . .

FROM node:18-alpine
WORKDIR /usr/src/app/spam_service
COPY --from=builder /usr/src/app/spam_service .
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /usr/src/app/spam_service
USER appuser
ENV NODE_ENV=production
CMD ["node", "service.js"]
