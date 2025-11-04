FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with npm ci (faster, more reliable) and clean npm cache
RUN npm ci --only=production=false && \
    npm cache clean --force

# Copy project files
COPY . .

# Expose port
EXPOSE 5173

# Default command
CMD ["npm", "run", "dev", "--", "--host"]

