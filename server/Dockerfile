FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY migrations ./migrations
ENV NODE_ENV=production
USER node
CMD ["npm", "start"]
