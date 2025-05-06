FROM denoland/deno:bin-2.0.0 AS deno
FROM mcr.microsoft.com/devcontainers/typescript-node:20
COPY --from=deno /deno /usr/local/bin/deno
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
    && echo "$SNIPPET" >> "/root/.bashrc"
# LABEL devcontainer.metadata='[{ \
#   "capAdd": [ "SYS_PTRACE" ], \
#   "remoteUser": "devcontainer", \
#   "postCreateCommand": "yarn install" \
# }]'