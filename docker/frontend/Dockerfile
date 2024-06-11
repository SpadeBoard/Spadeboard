FROM node:22.8.0-alpine3.20
# Set environment variable
ENV NODE_ENV=development

# Create and set the working directory
WORKDIR /app/frontend

# Copy package.json and package-lock.json first because you can't bloody install something you don't have
COPY ../../frontend/package*.json ./

RUN npm install -g @angular/cli

RUN npm install

# Copy the enitre project
COPY ../../frontend .

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "80"]

# TODO: Use Nginx builder to pass in environment variables