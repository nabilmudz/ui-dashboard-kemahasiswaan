# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./
RUN npm ci

# Salin seluruh file project
COPY . .

# Definisikan build-time environment variables agar tertanam saat build Vite
ARG VITE_SSO_URL
ARG VITE_CLIENT_ID
ARG VITE_REDIRECT_URI
ARG VITE_API_URL

ENV VITE_SSO_URL=$VITE_SSO_URL
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID
ENV VITE_REDIRECT_URI=$VITE_REDIRECT_URI
ENV VITE_API_URL=$VITE_API_URL

# Jalankan build static files
RUN npm run build

# Stage 2: Serve stage menggunakan Nginx
FROM nginx:alpine

# Salin konfigurasi custom Nginx untuk support Vue Router history mode
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin static files dari builder stage ke folder Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
