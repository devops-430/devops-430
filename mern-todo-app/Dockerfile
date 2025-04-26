# Build stage for frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build stage for backend
FROM node:18-alpine
WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Copy built frontend files
COPY --from=frontend-build /app/frontend/build ./public

# Expose ports
EXPOSE 8001
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 