ARG VARIANT=16-bullseye

FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

RUN corepack enable
RUN corepack prepare pnpm@7.9.0 --activate
