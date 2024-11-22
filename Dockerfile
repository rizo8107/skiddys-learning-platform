# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the project
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install necessary tools
RUN apk add --no-cache wget unzip

# Install production dependencies
COPY package*.json ./
RUN npm install --production

# Install express for serving the application
RUN npm install express

# Copy built assets and backend
COPY --from=build /app/dist ./dist
COPY --from=build /app/backend ./backend

# Download PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.21.1/pocketbase_0.21.1_linux_amd64.zip \
    && unzip pocketbase_0.21.1_linux_amd64.zip -d /app/backend \
    && rm pocketbase_0.21.1_linux_amd64.zip \
    && chmod +x /app/backend/pocketbase

# Expose the port
EXPOSE 8090

# Start the application
CMD ["node", "backend/server.js"]
