FROM node:latest

RUN node --version
RUN npm --version

COPY package.json package-lock.json* /var/task/

WORKDIR /var/task
RUN npm install

EXPOSE 3000:3000
EXPOSE 3001:3001

COPY . .
