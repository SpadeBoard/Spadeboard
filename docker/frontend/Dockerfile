# Use the official Node.js image as a base
FROM node:22-alpine

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

# Expose port 3000
EXPOSE 3000

# Start the React application
CMD ["npm", "start"]

