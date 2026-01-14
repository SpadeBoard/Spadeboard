FROM node:22.12-alpine3.20
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

ARG GIT_BRANCH=unknown
ARG GIT_HASH=unknown
ARG APP_VERSION=unknown

ENV GIT_BRANCH=$GIT_BRANCH \
    GIT_HASH=$GIT_HASH \
    APP_VERSION=$APP_VERSION

RUN node git-version.js
RUN npm run build

CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "80"]

# TODO: Use Nginx builder to pass in environment variables