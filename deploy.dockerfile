# Node LTS ổn định
FROM node:20-alpine

# Tạo thư mục app
WORKDIR /app

# Copy package files trước để cache layer
COPY package*.json ./

# Cài dependencies (prod only)
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Không expose port cứng (platform sẽ inject)
EXPOSE 3000

# Chạy app
CMD ["node", "server.js"]
