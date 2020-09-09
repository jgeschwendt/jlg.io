FROM node:lts

RUN node --version
RUN npm --version

COPY elm.json package.json package-lock.json /var/task/

WORKDIR /var/task
RUN npm install

EXPOSE 3000:3000
EXPOSE 3001:3001

COPY src                /var/task/src
COPY typings            /var/task/typings

COPY babel.config.json  /var/task
COPY serverless.yml     /var/task
COPY tsconfig.json      /var/task
COPY webpack.config.js  /var/task

RUN npm run build
