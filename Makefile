# Load the environment variables
ifdef ENV
export ENV_FILE = .env.$(ENV)
else
export ENV_FILE = .env
endif

# include variables for use in this Makefile
include $(ENV_FILE)

# export variables for command usage (ie. docker-compose)
export CONTAINER_NAME = jlg/jlg.io
export CONTAINER_MOUNT = jlg.io.mount
export NODE_CONTAINER = \
	--interactive \
	--rm \
	--tty \
	--volume $(shell pwd)/dist:/var/task/dist \
	--volume $(shell pwd)/src:/var/task/src \
	--workdir /var/task \
	$(CONTAINER_NAME)


# npm scripts`

build:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run build

check:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run lint-fix
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run tsc

install:
	rm -rf node_modules
	rm -f package-lock.json
	docker build --tag $(CONTAINER_NAME) .
	docker create --name $(CONTAINER_MOUNT) $(CONTAINER_NAME)
	docker cp $(CONTAINER_MOUNT):/var/task/node_modules ./node_modules
	docker cp $(CONTAINER_MOUNT):/var/task/package-lock.json ./package-lock.json
	docker rm --force --volumes $(CONTAINER_MOUNT)

lint:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run lint

lint-fix:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run lint-fix

npm-check:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run npm-check-updates

npm-check-updates:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run npm-check-updates -u

profile:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run profile

profile-dev:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run profile-dev

start:
	docker run --env-file $(ENV_FILE) --publish 3000:3000 $(NODE_CONTAINER) npm run start

tsc:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run tsc

tsc-watch:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run tsc-watch


# infrastructure

build-container:
	docker build --tag $(CONTAINER_NAME) .

build-container-no-cache:
	docker build --no-cache --tag $(CONTAINER_NAME) .

deploy:
	rm -rf dist
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) yarn run build
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) node node_modules/.bin/serverless client deploy --no-confirm

provision:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) node node_modules/.bin/serverless deploy --stage $(ENV)

# utils

dev:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) /bin/bash

kill-containers:
	-docker stop $(shell docker ps --all --quiet)
	-docker rm $(shell docker ps --all --quiet)
