FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

# Copy package files
COPY package.json ./

# Install all dependencies (needed for @edgeandnode/amp)
RUN pnpm install

# Copy built JavaScript files
COPY dist ./dist

# Expose port
EXPOSE 3001

# Run the built JavaScript
CMD ["pnpm", "start"]

