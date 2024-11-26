# Build stage
FROM node:18-alpine as builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy project files
COPY . .

# Build argument for API URL with default value
ARG VITE_API_URL=https://skiddy-pocketbase.9dto0s.easypanel.host/
ENV VITE_API_URL=${VITE_API_URL}

# Build the project
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a script to replace environment variables at runtime
RUN echo "#!/bin/sh\n\
    envsubst '\${VITE_API_URL}' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp\n\
    mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html\n\
    exec nginx -g 'daemon off;'" > /docker-entrypoint.sh \
    && chmod +x /docker-entrypoint.sh

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Expose port
EXPOSE 80

# Start Nginx using our entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
