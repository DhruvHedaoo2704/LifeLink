# Stage 1: Build the React frontend
FROM node:20-alpine AS build

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy full source code
COPY . .

# Build the frontend assets
RUN npm run build

# Stage 2: Serve the application in production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy package descriptors
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy backend source code and frontend compiled bundle
COPY backend ./backend
COPY --from=build /app/dist ./dist

# Cloud Run defaults to exposing port 8080
EXPOSE 8080

# Run the backend server
CMD ["node", "backend/server.js"]
