FROM node:lts

RUN node --version
RUN npm --version

COPY package.json package-lock.json /var/task/

WORKDIR /var/task
RUN npm install

EXPOSE 3000:3000
EXPOSE 3001:3001

COPY src                /var/task/src

COPY babel.config.js    /var/task
COPY serverless.yml     /var/task
COPY tsconfig.json      /var/task
COPY webpack.config.js  /var/task

RUN npx jest --config src/pages/ProjectEuler/jest.config.js
RUN npm run build
