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
	--volume $(shell pwd):/var/task/ \
	--workdir /var/task \
	$(CONTAINER_NAME)

# workspace

bash:
	@docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) /bin/bash

container:
	docker build --tag $(CONTAINER_NAME) .

container-no-cache:
	docker build --no-cache --tag $(CONTAINER_NAME) .

log:
	@docker-compose logs -f jlg.io

install:
	rm -rf node_modules
	docker build --tag $(CONTAINER_NAME) .
	docker create --name $(CONTAINER_MOUNT) $(CONTAINER_NAME)
	docker cp $(CONTAINER_MOUNT):/var/task/node_modules ./node_modules
	docker cp $(CONTAINER_MOUNT):/var/task/package-lock.json ./package-lock.json
	docker rm --force --volumes $(CONTAINER_MOUNT)

start:
	@make stop
	@docker-compose -f docker-compose.yml up -d --no-recreate --remove-orphans
	# give webpack a couple seconds to get the dev server running
	@sleep 2
	open http://0.0.0.0:3000

stop:
	@docker-compose -f docker-compose.yml down --remove-orphans --volumes

stop-docker:
	@make stop
	@docker ps -aq | xargs docker stop
	@docker ps -aq | xargs docker rm


# npm run-scripts

build:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run build

check:
	@make link
	@make tsc

lint:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run lint

lint-fix:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run lint-fix

nc:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run npm-check-updates

ncu:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run npm-check-updates -u

profile:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run profile

profile-dev:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run profile-dev

tsc:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run tsc

tsc-watch:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npm run tsc-watch

# ???

deploy:
	rm -rf dist
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) yarn run build
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npx serverless client deploy --no-confirm

provision:
	docker run --env-file $(ENV_FILE) $(NODE_CONTAINER) npx serverless deploy --stage $(ENV)
