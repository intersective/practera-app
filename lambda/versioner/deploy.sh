#!/bin/bash

set -e

: "${STACK_NAME:?Need to set STACK_NAME}"
: "${ENV:?Need to set ENV}"
: "${REGION:?Need to set REGION}"

zip -r bin/handler.zip index.js package*.json node_modules/
sam deploy \
    --stack-name "$STACK_NAME-appv3-lambdaedge-versioner-$ENV" \
    --s3-bucket "$STACK_NAME-lambda-edge-$ENV" \
    --s3-prefix "versioner" \
    --region "$REGION" \
    --capabilities "CAPABILITY_IAM" \
    --parameter-overrides \
    StackName="$STACK_NAME" \
    Env="$ENV"
