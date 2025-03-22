#!/bin/sh

IMAGE_NAME=$(npm pkg get name | tr -d \")
IMAGE_TAG=$(npm pkg get version | tr -d \")-$(git rev-parse --short HEAD)

docker build -t "$IMAGE_NAME:$IMAGE_TAG" .
docker tag "$IMAGE_NAME:$IMAGE_TAG" "$IMAGE_NAME:latest"
