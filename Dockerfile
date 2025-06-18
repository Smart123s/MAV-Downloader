# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json (if available)
# Using package-lock.json* to be lenient if it's not committed, though it should be.
COPY package.json ./
COPY package-lock.json* ./

# Install all dependencies (including devDependencies needed for the build)
RUN npm install

# Copy the rest of the application source code
# A .dockerignore file is recommended to exclude node_modules, .git, etc.
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Create the production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# The Next.js app will run on port 3000 by default.
# You can set a different port by uncommenting and setting the PORT environment variable.
# ENV PORT=3000

# Copy package.json and package-lock.json (if available) again to install only production dependencies
COPY package.json ./
COPY package-lock.json* ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the built Next.js application artifacts from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
# package.json is already here from the previous COPY and npm install step.

# Expose the port the app will run on
EXPOSE 3000

# Command to run the application
# This will execute the "start" script defined in package.json ("next start")
CMD ["npm", "run", "start"]
