#!/bin/bash

NOTED_TIMEOUT=3600
NOTED_DIR="$HOME/.noted"
NOTED_BIN="$NOTED_DIR/noted"

noted() {
    if [[ "${1}" == "__complete" ]]; then
        shift
        "$NOTED_BIN" __complete "${@}"
        return $?
    fi

    if [[ "${1}" == "completion" ]]; then
        shift
        "$NOTED_BIN" completion "${@}"
        return $?
    fi

    if [ "$1" = "" ]; then
        "$NOTED_BIN"
        return $?
    fi

    if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        "$NOTED_BIN" "$1"
        return $?
    fi

    if ! "$NOTED_BIN" "$1" --help &>/dev/null; then
        echo "Error: unknown command \"$1\" for \"noted\""
        echo "Run 'noted --help' for usage."
        return 1
    fi

    current_time=$(date +%s)

    if [ "$1" = "unlock" ]; then
        local key=$("$NOTED_BIN" unlock 2>/dev/tty)
        if [ $? -eq 0 ]; then
            export NOTED_KEY="$key"
            export NOTED_EXPIRES_AT=$((current_time + NOTED_TIMEOUT))
        fi
        return $?
    fi

    case "$1" in
        "auth"|"edit"|"help"|"image"|"tags"|"preview"|"setup-encryption"|"theme"|"unlock"|"list"|"search"|"completion")
            "$NOTED_BIN" "$@"
            return $?
            ;;
    esac

    if [ -z "$NOTED_KEY" ] || [ -z "$NOTED_EXPIRES_AT" ] || [ $current_time -gt $NOTED_EXPIRES_AT ]; then
        local key=$("$NOTED_BIN" unlock 2>/dev/tty)
        if [ $? -eq 0 ]; then
            export NOTED_KEY="$key"
            export NOTED_EXPIRES_AT=$((current_time + NOTED_TIMEOUT))
        else
            return 1
        fi
    fi

    "$NOTED_BIN" "$@"
}
