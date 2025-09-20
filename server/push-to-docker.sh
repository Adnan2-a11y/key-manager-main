#!/bin/bash
VERSION=$1
docker build -t key-hub:$VERSION . &&
docker tag key-hub:$VERSION autocircled/key-hub:$VERSION &&
docker push autocircled/key-hub:$VERSION
