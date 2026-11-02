# Stage 1: Build the React application
FROM node:22-alpine AS build

WORKDIR /app

# Build arguments for frontend environment variables
ARG VITE_API_URL=""
ARG VITE_GOOGLE_MAPS_API_KEY=""

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

# Cache dependencies layer
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source code
COPY . .

# Build production bundle into /app/dist
RUN npm run build

# Stage 2: Production web server using lightweight Nginx
FROM nginx:1.27-alpine AS production

# Clear default Nginx web root
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA routing and caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose standard HTTP port
EXPOSE 80

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Launch Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

