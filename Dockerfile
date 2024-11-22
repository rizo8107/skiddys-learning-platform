# Build stage
FROM node:18-alpine as builder

# Install dependencies required for building
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install necessary tools
RUN apk add --no-cache wget unzip

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Download and set up PocketBase
WORKDIR /app
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.21.1/pocketbase_0.21.1_linux_amd64.zip \
    && unzip -o pocketbase_0.21.1_linux_amd64.zip \
    && mv pocketbase /usr/local/bin/ \
    && chmod +x /usr/local/bin/pocketbase \
    && rm pocketbase_0.21.1_linux_amd64.zip \
    && rm -f CHANGELOG.md LICENSE.md

# Create data directory
RUN mkdir -p /pb_data

# Copy PocketBase data if exists
COPY backend/pb_data /pb_data

# Expose ports
EXPOSE 80
EXPOSE 8090

# Copy start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
