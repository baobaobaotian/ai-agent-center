FROM node:18-alpine

WORKDIR /app

# 复制 package.json
COPY package*.json ./
RUN npm install --production

# 复制所有文件
COPY . .

# 创建数据目录
RUN mkdir -p data uploads

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "backend/server.js"]
