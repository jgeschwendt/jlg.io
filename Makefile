# Load the environment variables
ifdef ENV
export ENV_FILE = .env.$(ENV)
else
export ENV_FILE = .env
endif

# include variables for use in this Makefile
include $(ENV_FILE)

export CONTAINER_NAME = jlg/jlg.io
export NODE_CONTAINER = \
	--interactive \
	--rm \
	--tty \
	--workdir /var/task \
	$(CONTAINER_NAME)

bash:
	docker build --file Dockerfile --tag $(CONTAINER_NAME) .
	@docker run --env-file $(ENV_FILE) --interactive --rm --tty $(CONTAINER_NAME) /bin/bash

container:
	docker build --file Dockerfile --no-cache --tag $(CONTAINER_NAME) .

deploy:
	docker build --file Dockerfile --tag $(CONTAINER_NAME) .
	docker run --env-file $(ENV_FILE) $(CONTAINER_NAME) npx serverless deploy --stage $(ENV)
