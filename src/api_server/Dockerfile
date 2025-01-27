FROM node:18.1.0-alpine AS builder
WORKDIR /usr/src/app/api_server
COPY package*.json ./
RUN npm install --production
COPY . .


FROM node:18.1.0-alpine
WORKDIR /usr/src/app/api_server
COPY --from=builder /usr/src/app/api_server .
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /usr/src/app/api_server
USER appuser
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "index.js"]