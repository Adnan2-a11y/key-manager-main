#!/bin/bash
VERSION=$1
docker build -t key-hub-front:$VERSION . &&
docker tag key-hub-front:$VERSION autocircled/key-hub-front:$VERSION &&
docker push autocircled/key-hub-front:$VERSION
