# Load the environment variables
ifdef ENV
export ENV_FILE = .env.$(ENV)
else
export ENV_FILE = .env
endif

# Include the envionment variables in this Makefile
include $(ENV_FILE)

# Export these variables for docker-compose usage
export CONTAINER_NAME = jlg.io/devbox
export NODE_CONTAINER = \
	--interactive \
	--rm \
	--tty \
	--volume $(shell pwd):/var/task \
	--workdir /var/task \
	$(CONTAINER_NAME)

build:
	@docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) yarn run build

check:
	@make tsc
	@make tslint

deploy:
	@make stop-docker
	@make build
	@docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) node node_modules/.bin/serverless client deploy --no-confirm

dev:
	@docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) /bin/bash

devbox:
	@docker build --no-cache --tag $(CONTAINER_NAME) .

install:
	@docker run $(NODE_CONTAINER) yarn install

profile:
	@docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) yarn run profile

provision:
	@make stop-docker
	@docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) node node_modules/.bin/serverless deploy --stage $(ENV)

start:
	@docker run --env-file $(ENV_FILE) --publish 3000:3000 $(NODE_CONTAINER) yarn run start

start-hard:
	rm -rf node_modules
	rm -f yarn.lock
	make devbox
	make install
	make start

stop-docker:
	@docker ps -aq | xargs docker stop
	@docker ps -aq | xargs docker rm

tsc:
	@docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) yarn run tsc

tslint:
	@docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) yarn run tslint

tslint-fix:
	@docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) yarn run tslint-fix
