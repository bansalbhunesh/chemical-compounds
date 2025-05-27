FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Create data directory
RUN mkdir -p /app/data

# Copy source code
COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]