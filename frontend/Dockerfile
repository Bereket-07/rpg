FROM node:20-alpine

WORKDIR /app

# Install dependencies into the image so node_modules exists before
# the source-code volume is mounted. The anonymous /app/node_modules
# volume in docker-compose protects these from being overwritten.
COPY package*.json ./
RUN npm install

EXPOSE 3000
CMD ["npm", "run", "dev"]
