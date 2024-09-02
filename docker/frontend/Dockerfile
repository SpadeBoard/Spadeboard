# Use the official Node.js image as a base
FROM node:22.8.0-alpine3.20

# Install curl
# Alpine comes with wget, not curl
# For health checks
RUN apk add --no-cache curl

# Set environment variable
ENV NODE_ENV=development

# Create and set the working directory
WORKDIR /app/frontend

# Copy package.json and package-lock.json to the working directory
COPY ./frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application to the working directory
COPY ./frontend ./

# Start the React application
CMD ["npm", "run", "dev"]