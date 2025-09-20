#!/bin/bash

CONTAINER_NAME=$1

if [ -z "$CONTAINER_NAME" ]; then
  echo "Usage: ./clear-docker-logs.sh <container_name>"
  exit 1
fi

ID=$(docker inspect --format='{{.Id}}' "$CONTAINER_NAME" 2>/dev/null)

if [ -z "$ID" ]; then
  echo "Container not found: $CONTAINER_NAME"
  exit 1
fi

LOGFILE="/var/lib/docker/containers/$ID/${ID}-json.log"

if [ -f "$LOGFILE" ]; then
  sudo truncate -s 0 "$LOGFILE"
  echo "Cleared logs for container: $CONTAINER_NAME"
else
  echo "Log file not found for container: $CONTAINER_NAME"
fi
