#!/usr/bin/env bash

# Can be replaced with docker and docker-compose
readonly CONTAINER_EXEC="${RUNNER:-podman}"
readonly CONTAINER_COMPOSE_EXEC="${RUNNER:-podman}-compose"

case "$1" in
"dev" | "")
    readonly ENV_FILE=.env.dev
    readonly PROJECT_NAME="dev"
    ;;
"test")
    readonly ENV_FILE=.env.test
    readonly PROJECT_NAME="test"
    ;;
*)
    echo "Unknown environment $1"
    exit 1
    ;;
esac

if [[ ! -f "${ENV_FILE}" ]]; then
    echo "Couldn't find environment file: ${ENV_FILE}"
    exit 1
else
    set -o allexport
    # shellcheck source=.
    source "${ENV_FILE}"
    set +o allexport
fi

readonly DB_SERVICE_NAME="store-${PROJECT_NAME}_store-db_1"

## Script code
"${CONTAINER_COMPOSE_EXEC}" -p "store-${PROJECT_NAME}" down
"${CONTAINER_COMPOSE_EXEC}" -p "store-${PROJECT_NAME}" up -d
sleep 1
"${CONTAINER_EXEC}" exec -u "${DB_USERNAME}" "${DB_SERVICE_NAME}" bash -c "createdb store" || true
