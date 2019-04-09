FROM node:latest

# install the latest version of yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | bash
ENV PATH /root/.yarn/bin:/root/.config/yarn/global/node_modules/.bin:$PATH

# check versions
RUN node --version
RUN yarn --version

WORKDIR /var/task

COPY package.json .

RUN yarn install

VOLUME node_modules

COPY . .

# expose development ports
EXPOSE 3000:3000
EXPOSE 3001:3001
