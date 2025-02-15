#!/bin/bash

NOTED_TIMEOUT=3600

noted() {
    if [ "$1" = "" ]; then
        ./noted
        return $?
    fi

    if ! ./noted "$1" --help &>/dev/null; then
        echo "Error: unknown command \"$1\" for \"noted\""
        echo "Run 'noted --help' for usage."
        return 1
    fi

    case "$1" in
        "auth"|"edit"|"help"|"image"|"tags"|"preview"|"setup-encryption"|"theme"|"lock")
            ./noted "$@"
            return $?
            ;;
    esac

    current_time=$(date +%s)

    if [ -z "$NOTED_KEY" ] || [ -z "$NOTED_EXPIRES_AT" ] || [ $current_time -gt $NOTED_EXPIRES_AT ]; then
        ./noted unlock 2>/dev/tty
        if [ $? -eq 0 ]; then
            export NOTED_KEY="$NOTED_TEMP_KEY"
            unset NOTED_TEMP_KEY
            export NOTED_EXPIRES_AT=$((current_time + NOTED_TIMEOUT))
        else
            return 1
        fi
    fi

    ./noted "$@"
}