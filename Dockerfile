FROM node:latest

RUN node --version
RUN npm --version

WORKDIR /var/task

COPY package.json .

RUN npm install

VOLUME node_modules
VOLUME package-lock.json

COPY . .

EXPOSE 3000:3000
EXPOSE 3001:3001
