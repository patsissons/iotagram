FROM mhart/alpine-node:latest

RUN npm install -g pm2 typescript

RUN npm install && \
    npm run build
